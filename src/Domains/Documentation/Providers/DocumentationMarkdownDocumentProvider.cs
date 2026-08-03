using Domains.Documentation.Utilities;
using Microsoft.Extensions.Options;
using Monica.Markdown.Abstractions;
using Monica.Markdown.Models;
using Monica.Markdown.Providers.FileSystem;
using Monica.Modules;

namespace Domains.Documentation.Providers;

/// <summary>
/// Reads Monica.Docs Markdown from the file system and expands release variables before content is indexed or served.
/// </summary>
public sealed class DocumentationMarkdownDocumentProvider(
    IMarkdownDocumentTitleResolver titleResolver,
    IOptions<ModuleLocalizationOption> localizationOptions)
    : IMarkdownDocumentProvider
{
    private readonly FileSystemMarkdownDocumentProvider _fileSystemProvider = new(
        titleResolver,
        localizationOptions);

    /// <inheritdoc />
    public Task<MarkdownDocumentGroup> ScanGroupAsync(
        MarkdownDocumentGroupRegistration registration,
        ModuleMarkdownOption options)
    {
        return _fileSystemProvider.ScanGroupAsync(registration, options);
    }

    /// <inheritdoc />
    public async Task<string> GetDocumentContentAsync(string documentPath)
    {
        var markdown = await _fileSystemProvider.GetDocumentContentAsync(documentPath);
        return DocumentationReleaseVariables.Expand(markdown);
    }

    /// <inheritdoc />
    public IMarkdownChangeNotifier? GetChangeNotifier()
    {
        return _fileSystemProvider.GetChangeNotifier();
    }
}
