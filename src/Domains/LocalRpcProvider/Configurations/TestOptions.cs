using Monica.Configuration.Annotations;

namespace Domains.LocalRpcProvider.Configurations;

[Configuration(DisplayName = "Test Display", Description = "Just For Test")]
public sealed class TestOptions
{
    
    [OptionSetting("Test", Description = "Test")]
    public string Test { get; set; } = "Test";
}
