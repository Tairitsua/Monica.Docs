using Monica.Docs.Domains.Documentation.Entities;
using Monica.Docs.Domains.Documentation.ValueObjects;

namespace Monica.Docs.Domains.Documentation.Interfaces;

public interface IDocumentationMarkdownProcessor
{
    DocumentationProcessedDocument Process(DocumentationSourceDocument document);
}
