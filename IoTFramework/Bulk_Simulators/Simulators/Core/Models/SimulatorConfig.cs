using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Simulators.Core.Models
{
    public class SimulatorConfig
    {
        public string TbHost { get; set; }
        public int MqttPort { get; set; }
        public string TenantJwt { get; set; }

        public int DeviceCount { get; set; }
        public int IntervalSeconds { get; set; }

        public string PayloadTemplate { get; set; }
    }
}
