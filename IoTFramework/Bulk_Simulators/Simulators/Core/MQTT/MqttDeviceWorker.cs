using MQTTnet;
using MQTTnet.Protocol;
using Simulators.Core.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Simulators.Core.MQTT
{
    public static class MqttDeviceWorker
    {
        public static async Task RunAsync(
            TbDevice device,
            SimulatorConfig config,
            CancellationToken token)
        {
            var factory = new MqttClientFactory();
            var client = factory.CreateMqttClient();

            var options = new MqttClientOptionsBuilder()
                .WithTcpServer(config.TbHost, config.MqttPort)
                .WithCredentials(device.Token, "")
                .WithCleanSession()
                .Build();

            await client.ConnectAsync(options, token);

            while (!token.IsCancellationRequested)
            {
                var payload = Telemetry.PayloadEngine.Build(
                    config.PayloadTemplate, device.Name);

                var message = new MqttApplicationMessageBuilder()
                    .WithTopic("v1/devices/me/telemetry")
                    .WithPayload(payload)
                    .WithQualityOfServiceLevel(
                        MqttQualityOfServiceLevel.AtLeastOnce)
                    .Build();

                await client.PublishAsync(message, token);

                await Task.Delay(
                    TimeSpan.FromSeconds(config.IntervalSeconds), token);
            }
        }
    }
}
