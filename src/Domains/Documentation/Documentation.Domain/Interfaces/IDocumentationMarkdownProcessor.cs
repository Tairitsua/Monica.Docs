using Monica.Docs.Domains.Documentation.Domain.Models;

namespace Monica.Docs.Domains.Documentation.Domain.Interfaces;

public interface IDocumentationMarkdownProcessor
{
    DocumentationProcessedDocument Process(DocumentationSourceDocument document);
}
