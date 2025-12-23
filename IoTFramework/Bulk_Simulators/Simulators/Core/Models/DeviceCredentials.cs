using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Text.Json.Serialization;
using System.Threading.Tasks;

namespace Simulators.Core.Models
{
    public class DeviceCredentials
    {
        [JsonPropertyName("credentialsId")]
        public string CredentialsId { get; set; }

        [JsonPropertyName("credentialsType")]
        public string CredentialsType { get; set; }
    }
}
