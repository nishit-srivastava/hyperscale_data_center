using Simulators.Core.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Net.Http.Json;
using System.Text;
using System.Threading.Tasks;

namespace Simulators.Core.Thingsboard
{
    public class ThingsBoardApiClient
    {
        private readonly HttpClient _http;

        public ThingsBoardApiClient(SimulatorConfig config)
        {
            _http = new HttpClient
            {
                BaseAddress = new Uri($"http://{config.TbHost}:8080")
            };

            _http.DefaultRequestHeaders.Add(
                "X-Authorization", $"Bearer {config.TenantJwt}");
        }

        public async Task<TbDevice> CreateDeviceAsync(string name)
        {
            var response = await _http.PostAsJsonAsync(
                "/api/device",
                new { name, type = "load-test" });

            response.EnsureSuccessStatusCode();

            return await response.Content
                .ReadFromJsonAsync<TbDevice>();
        }

        public async Task<string> GetDeviceTokenAsync(string deviceId)
        {
            var cred = await _http.GetFromJsonAsync<DeviceCredentials>(
                $"/api/device/{deviceId}/credentials");

            return cred.CredentialsId;
        }
    }

}
