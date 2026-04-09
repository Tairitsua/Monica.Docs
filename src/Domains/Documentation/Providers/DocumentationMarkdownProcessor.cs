using System.Net;
using System.Text;
using System.Text.RegularExpressions;
using Markdig;
using Markdig.Syntax;
using Markdig.Syntax.Inlines;
using Microsoft.Extensions.Options;
using Monica.Docs.Domains.Documentation.Configurations;
using Monica.Docs.Domains.Documentation.Entities;
using Monica.Docs.Domains.Documentation.Interfaces;
using Monica.Docs.Domains.Documentation.DomainServices;
using Monica.Docs.Domains.Documentation.ValueObjects;

namespace Monica.Docs.Domains.Documentation.Providers;

public sealed partial class DocumentationMarkdownProcessor(
    IOptions<DocumentationApiOptions> options)
    : IDocumentationMarkdownProcessor
{
    private static readonly MarkdownPipeline Pipeline = new MarkdownPipelineBuilder()
        .UseAdvancedExtensions()
        .Build();

    private readonly DocumentationApiOptions _options = options.Value;

    public DocumentationProcessedDocument Process(DocumentationSourceDocument document)
    {
        var normalizedMarkdown = StripLeadingFrontMatter(document.Markdown);
        var rewrittenMarkdown = RewriteAssetUrls(normalizedMarkdown, document.RelativePath);
        return new DocumentationProcessedDocument(
            rewrittenMarkdown,
            ParseHeadings(rewrittenMarkdown));
    }

    private string RewriteAssetUrls(string markdown, string documentRelativePath)
    {
        if (string.IsNullOrWhiteSpace(markdown))
        {
            return markdown;
        }

        return MarkdownLinkPattern().Replace(markdown, match =>
        {
            var originalUrl = match.Groups["url"].Value;
            if (!DomainDocumentationPathRules.TryResolveLocalAssetPath(
                    documentRelativePath,
                    originalUrl,
                    out var assetRelativePath))
            {
                return match.Value;
            }

            var rewrittenUrl = DomainDocumentationPathRules.BuildAssetUrl(
                _options.AssetBasePath,
                assetRelativePath);

            return string.Concat(
                match.Groups["prefix"].Value,
                rewrittenUrl,
                match.Groups["suffix"].Value);
        });
    }

    private static IReadOnlyList<DocumentationHeading> ParseHeadings(string? markdown)
    {
        if (string.IsNullOrWhiteSpace(markdown))
        {
            return [];
        }

        var document = Markdig.Markdown.Parse(markdown, Pipeline);
        if (document.Count == 0)
        {
            return [];
        }

        var headings = new List<DocumentationHeading>();
        CollectHeadings(document, headings);
        return headings;
    }

    private static void CollectHeadings(
        ContainerBlock container,
        ICollection<DocumentationHeading> headings)
    {
        foreach (var block in container)
        {
            switch (block)
            {
                case HeadingBlock heading:
                {
                    var parsedHeading = CreateHeading(heading);
                    if (parsedHeading is not null)
                    {
                        headings.Add(parsedHeading);
                    }

                    break;
                }
                case ContainerBlock nestedContainer:
                    CollectHeadings(nestedContainer, headings);
                    break;
            }
        }
    }

    private static DocumentationHeading? CreateHeading(HeadingBlock heading)
    {
        if (heading.Inline is null)
        {
            return null;
        }

        var idBuilder = new StringBuilder();
        var textBuilder = new StringBuilder();

        foreach (var inline in heading.Inline)
        {
            if (inline is not LiteralInline literalInline || literalInline.Content.IsEmpty)
            {
                continue;
            }

            var text = literalInline.Content.ToString();
            if (string.IsNullOrEmpty(text))
            {
                continue;
            }

            textBuilder.Append(text);
            AppendHeadingIdSegment(idBuilder, text);
        }

        if (idBuilder.Length == 0 || textBuilder.Length == 0)
        {
            return null;
        }

        return new DocumentationHeading(
            WebUtility.UrlEncode(idBuilder.ToString()),
            textBuilder.ToString(),
            heading.Level);
    }

    private static void AppendHeadingIdSegment(StringBuilder builder, string text)
    {
        var remaining = text.AsSpan();
        while (!remaining.IsEmpty)
        {
            var spaceIndex = remaining.IndexOf(' ');
            if (spaceIndex < 0)
            {
                AppendLowerInvariant(builder, remaining);
                break;
            }

            if (spaceIndex > 0)
            {
                AppendLowerInvariant(builder, remaining[..spaceIndex]);
                builder.Append('-');
            }

            remaining = remaining[(spaceIndex + 1)..];
        }
    }

    private static void AppendLowerInvariant(
        StringBuilder builder,
        ReadOnlySpan<char> segment)
    {
        foreach (var character in segment)
        {
            builder.Append(char.ToLowerInvariant(character));
        }
    }

    private static string StripLeadingFrontMatter(string markdown)
    {
        if (!markdown.StartsWith("---", StringComparison.Ordinal))
        {
            return markdown;
        }

        using var reader = new StringReader(markdown);
        var firstLine = reader.ReadLine();
        if (!string.Equals(firstLine, "---", StringComparison.Ordinal))
        {
            return markdown;
        }

        string? line;
        while ((line = reader.ReadLine()) is not null)
        {
            if (!string.Equals(line, "---", StringComparison.Ordinal))
            {
                continue;
            }

            var remainingMarkdown = reader.ReadToEnd();
            return remainingMarkdown.TrimStart('\r', '\n');
        }

        return markdown;
    }

    [GeneratedRegex(@"(?<prefix>!?\[[^\]]*\]\()(?<url>[^)\s]+)(?<suffix>\))")]
    private static partial Regex MarkdownLinkPattern();
}
