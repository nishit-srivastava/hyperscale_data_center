using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Text.Json.Serialization;
using System.Threading.Tasks;

namespace Simulators.Core.Models
{
    public class TbDevice
    {
        [JsonPropertyName("id")]
        public TbEntityId Id { get; set; }

        [JsonPropertyName("name")]
        public string Name { get; set; }

        // Runtime only
        public string Token { get; set; }
    }

    public class TbEntityId
    {
        [JsonPropertyName("id")]
        public string Id { get; set; }

        [JsonPropertyName("entityType")]
        public string EntityType { get; set; }
    }
}
