import { Injectable, BadRequestException } from "@nestjs/common";
// eslint-disable-next-line @typescript-eslint/no-require-imports
const { PDFParse } = require("pdf-parse");
import * as mammoth from "mammoth";

@Injectable()
export class FileParserService {
    async extractText(
        buffer: Buffer,
        mimetype: string,
        originalName: string,
    ): Promise<{ text: string; metadata: Record<string, any> }> {
        const extension = originalName.split(".").pop()?.toLowerCase();

        switch (extension) {
            case "pdf":
                return this.extractFromPdf(buffer);
            case "docx":
                return this.extractFromDocx(buffer);
            case "doc":
                throw new BadRequestException(
                    "Legacy .doc format not supported. Please convert to .docx",
                );
            case "txt":
                return this.extractFromTxt(buffer);
            case "tex":
                return this.extractFromLatex(buffer);
            default:
                throw new BadRequestException(
                    `Unsupported file type: ${extension}. Supported: PDF, DOCX, TXT, TEX`,
                );
        }
    }

    private async extractFromPdf(
        buffer: Buffer,
    ): Promise<{ text: string; metadata: Record<string, any> }> {
        try {
            // pdf-parse v2.x uses PDFParse class with options object
            const parser = new PDFParse({ data: buffer });
            
            // Get text content
            const result = await parser.getText({ parseHyperlinks: true });
            let text = result.text || "";

            // Get page info including embedded hyperlinks
            const info = await parser.getInfo({ parsePageInfo: true });
            const allLinks: { url: string; text: string }[] = [];
            
            for (const page of info.pages || []) {
                for (const link of page.links || []) {
                    if (link.url) {
                        allLinks.push({ url: link.url, text: link.text || "" });
                    }
                }
            }

            const metadata: Record<string, any> = {
                pages: result.total,
                links: allLinks,
            };

            // Post-process to preserve phone numbers and emails
            text = this.enhanceExtractedText(text);

            // Append embedded links that aren't visible in text
            if (allLinks.length > 0) {
                const linksSection: string[] = [];
                for (const link of allLinks) {
                    // Check if URL is already in text
                    if (!text.includes(link.url)) {
                        if (link.text && link.text !== link.url) {
                            linksSection.push(`${link.text}: ${link.url}`);
                        } else {
                            linksSection.push(link.url);
                        }
                    }
                }
                if (linksSection.length > 0) {
                    // Remove duplicates
                    const uniqueLinks = [...new Set(linksSection)];
                    text += "\n\n--- Embedded Links ---\n" + uniqueLinks.join("\n");
                }
            }

            // Clean up parser
            await parser.destroy();

            return { text, metadata };
        } catch (error) {
            throw new BadRequestException(`Failed to parse PDF: ${error.message}`);
        }
    }

    /**
     * Extract text from DOCX including hyperlinks
     */
    private async extractFromDocx(
        buffer: Buffer,
    ): Promise<{ text: string; metadata: Record<string, any> }> {
        try {
            // Extract raw text
            const textResult = await mammoth.extractRawText({ buffer });
            let text = textResult.value || "";

            // Also extract with HTML to get hyperlinks
            const htmlResult = await mammoth.convertToHtml({ buffer });
            const links = this.extractLinksFromHtml(htmlResult.value);

            // Append links if they exist and aren't already in text
            if (links.length > 0) {
                const uniqueLinks = links.filter((link) => !text.includes(link));
                if (uniqueLinks.length > 0) {
                    text += "\n\nLinks found:\n" + uniqueLinks.join("\n");
                }
            }

            // Enhance text extraction
            text = this.enhanceExtractedText(text);

            return {
                text,
                metadata: {
                    warnings: textResult.messages,
                    linksFound: links.length,
                },
            };
        } catch (error) {
            throw new BadRequestException(`Failed to parse DOCX: ${error.message}`);
        }
    }

    /**
     * Extract text from plain text file
     */
    private async extractFromTxt(
        buffer: Buffer,
    ): Promise<{ text: string; metadata: Record<string, any> }> {
        const text = buffer.toString("utf-8");
        return {
            text: this.enhanceExtractedText(text),
            metadata: { format: "plain-text" },
        };
    }

    /**
     * Extract text from LaTeX file
     * Removes LaTeX commands while preserving content
     */
    private async extractFromLatex(
        buffer: Buffer,
    ): Promise<{ text: string; metadata: Record<string, any> }> {
        let text = buffer.toString("utf-8");

        // Remove LaTeX comments
        text = text.replace(/%.*$/gm, "");

        // Remove common LaTeX commands but keep content
        const commandsToRemove = [
            /\\documentclass(\[.*?\])?\{.*?\}/g,
            /\\usepackage(\[.*?\])?\{.*?\}/g,
            /\\begin\{document\}/g,
            /\\end\{document\}/g,
            /\\begin\{(itemize|enumerate|description)\}/g,
            /\\end\{(itemize|enumerate|description)\}/g,
            /\\begin\{center\}/g,
            /\\end\{center\}/g,
            /\\maketitle/g,
            /\\newpage/g,
            /\\clearpage/g,
            /\\vspace\{.*?\}/g,
            /\\hspace\{.*?\}/g,
            /\\setlength\{.*?\}\{.*?\}/g,
            /\\pagestyle\{.*?\}/g,
        ];

        commandsToRemove.forEach((regex) => {
            text = text.replace(regex, "");
        });

        // Extract content from common resume commands
        text = text.replace(/\\section\*?\{(.*?)\}/g, "\n\n$1\n");
        text = text.replace(/\\subsection\*?\{(.*?)\}/g, "\n$1\n");
        text = text.replace(/\\textbf\{(.*?)\}/g, "$1");
        text = text.replace(/\\textit\{(.*?)\}/g, "$1");
        text = text.replace(/\\emph\{(.*?)\}/g, "$1");
        text = text.replace(/\\underline\{(.*?)\}/g, "$1");
        text = text.replace(/\\href\{(.*?)\}\{(.*?)\}/g, "$2 ($1)");
        text = text.replace(/\\url\{(.*?)\}/g, "$1");
        text = text.replace(/\\item\s*/g, "• ");

        // Remove remaining LaTeX commands
        text = text.replace(/\\[a-zA-Z]+\{.*?\}/g, "");
        text = text.replace(/\\[a-zA-Z]+/g, "");

        // Clean up braces and extra whitespace
        text = text.replace(/[{}]/g, "");
        text = text.replace(/\n{3,}/g, "\n\n");
        text = text.trim();

        text = this.enhanceExtractedText(text);

        return {
            text,
            metadata: { format: "latex" },
        };
    }

    /**
     * Extract hyperlinks from HTML content
     */
    private extractLinksFromHtml(html: string): string[] {
        const linkRegex = /href=["'](https?:\/\/[^"']+)["']/g;
        const links: string[] = [];
        let match;

        while ((match = linkRegex.exec(html)) !== null) {
            if (!links.includes(match[1])) {
                links.push(match[1]);
            }
        }

        return links;
    }

    /**
     * Enhance extracted text by identifying and preserving important info
     */
    private enhanceExtractedText(text: string): string {
        // Find phone numbers and format them clearly
        const phonePatterns = [
            /(\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/g,
            /(\+?\d{1,3}[-.\s]?)?\d{10}/g,
            /(\+\d{1,3}\s?)?\d{5}[-.\s]?\d{5}/g,
        ];

        // Find emails
        const emailPattern = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;

        // Find LinkedIn URLs
        const linkedinPattern =
            /(?:https?:\/\/)?(?:www\.)?linkedin\.com\/in\/[a-zA-Z0-9_-]+\/?/g;

        // Find GitHub URLs
        const githubPattern =
            /(?:https?:\/\/)?(?:www\.)?github\.com\/[a-zA-Z0-9_-]+\/?/g;

        // Collect all found items
        const phones = new Set<string>();
        const emails = new Set<string>();
        const linkedins = new Set<string>();
        const githubs = new Set<string>();

        phonePatterns.forEach((pattern) => {
            const matches = text.match(pattern);
            if (matches) matches.forEach((m) => phones.add(m.trim()));
        });

        const emailMatches = text.match(emailPattern);
        if (emailMatches) emailMatches.forEach((m) => emails.add(m));

        const linkedinMatches = text.match(linkedinPattern);
        if (linkedinMatches) linkedinMatches.forEach((m) => linkedins.add(m));

        const githubMatches = text.match(githubPattern);
        if (githubMatches) githubMatches.forEach((m) => githubs.add(m));

        // Clean up the text
        text = text.replace(/\r\n/g, "\n");
        text = text.replace(/[ \t]+/g, " ");
        text = text.replace(/\n{3,}/g, "\n\n");
        text = text.trim();

        // Append contact info summary if found
        const contactInfo: string[] = [];
        if (phones.size > 0) contactInfo.push(`Phone: ${[...phones].join(", ")}`);
        if (emails.size > 0) contactInfo.push(`Email: ${[...emails].join(", ")}`);
        if (linkedins.size > 0)
            contactInfo.push(`LinkedIn: ${[...linkedins].join(", ")}`);
        if (githubs.size > 0)
            contactInfo.push(`GitHub: ${[...githubs].join(", ")}`);

        if (contactInfo.length > 0 && !text.includes("Contact Information")) {
            text =
                `--- Contact Information ---\n${contactInfo.join("\n")}\n---\n\n` +
                text;
        }

        return text;
    }
}
