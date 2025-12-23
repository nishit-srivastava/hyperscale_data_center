using Microsoft.Extensions.Configuration;

namespace Simulator
{
    public static class AppConfig
    {
        public static IConfiguration Load()
        {
            return new ConfigurationBuilder()
                .SetBasePath(AppContext.BaseDirectory)
                .AddJsonFile("appsettings.json", optional: false)
                .Build();
        }
    }
}
