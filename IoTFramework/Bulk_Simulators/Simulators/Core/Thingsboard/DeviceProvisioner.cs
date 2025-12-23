using Simulators.Core.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Simulators.Core.Thingsboard
{
    public static class DeviceProvisioner
    {
        public static async Task<List<TbDevice>> ProvisionAsync(
            ThingsBoardApiClient api,
            SimulatorConfig config)
        {
            var devices = new List<TbDevice>();

            for (int i = 1; i <= config.DeviceCount; i++)
            {
                var name = $"sim-device-{i:D4}";
                var device = await api.CreateDeviceAsync(name);

                device.Token = await api
                    .GetDeviceTokenAsync(device.Id.Id);

                devices.Add(device);
            }

            return devices;
        }
    }

}
