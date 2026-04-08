using Monica.Docs.Domains.Documentation.Models;

namespace Monica.Docs.Domains.Documentation.Interfaces;

public interface IDocumentationMarkdownProcessor
{
    DocumentationProcessedDocument Process(DocumentationSourceDocument document);
}
