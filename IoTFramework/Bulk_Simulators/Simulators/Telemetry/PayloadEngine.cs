using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Simulators.Telemetry
{
    public static class PayloadEngine
    {
        public static string Build(string template, string deviceName)
        {
            return template
                .Replace("{device}", deviceName)
                .Replace("{ts}",
                    DateTimeOffset.UtcNow.ToUnixTimeSeconds().ToString())
                .Replace("{rand}",
                    Random.Shared.Next(1, 100).ToString());
        }
    }

}
