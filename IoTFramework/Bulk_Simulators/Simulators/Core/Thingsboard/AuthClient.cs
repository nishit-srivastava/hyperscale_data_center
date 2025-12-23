using System;
using System.Collections.Generic;
using System.Linq;
using System.Net.Http.Json;
using System.Text;
using System.Text.Json;
using System.Threading.Tasks;

namespace Simulators.Core.Thingsboard
{
    public static class AuthClient
    {
        public static async Task<string> LoginAsync(
            string baseUrl,
            string username,
            string password)
        {
            using var http = new HttpClient();

            var res = await http.PostAsJsonAsync(
                $"{baseUrl}/api/auth/login",
                new { username, password });

            res.EnsureSuccessStatusCode();

            var json = await res.Content.ReadFromJsonAsync<JsonElement>();
            return json.GetProperty("token").GetString();
        }
    }
}
