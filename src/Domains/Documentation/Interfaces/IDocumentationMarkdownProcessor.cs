using Domains.Documentation.Entities;
using Domains.Documentation.ValueObjects;

namespace Domains.Documentation.Interfaces;

public interface IDocumentationMarkdownProcessor
{
    DocumentationProcessedDocument Process(DocumentationSourceDocument document);
}
