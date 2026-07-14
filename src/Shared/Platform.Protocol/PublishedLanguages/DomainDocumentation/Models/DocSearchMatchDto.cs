namespace Platform.Protocol.PublishedLanguages.DomainDocumentation.Models;

/// <summary>
/// Identifies a highlighted match segment inside a documentation search preview.
/// </summary>
/// <param name="Start">The zero-based start index in the preview text.</param>
/// <param name="Length">The highlighted segment length.</param>
public sealed record DocSearchMatchDto(int Start, int Length);
