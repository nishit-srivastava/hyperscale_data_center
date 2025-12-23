using Simulators.Core.Models;
using Simulators.Core.MQTT;
using Simulators.Core.Thingsboard;
using System.Text.Json;
using System.Windows.Forms;

namespace Simulator
{
    public partial class MainForm : Form
    {
        private CancellationTokenSource _cts;


        public MainForm()
        {
            InitializeComponent();
        }

        private async void btnStart_Click(object sender, EventArgs e)
        {
            try
            {
                ValidateJson(txtPayload.Text);

                btnStart.Enabled = false;
                btnStop.Enabled = true;
                _cts = new CancellationTokenSource();
                lblStatus.Text = "Status: Authenticating...";

                var configRoot = AppConfig.Load();

                var baseUrl = configRoot["ThingsBoard:BaseUrl"];
                var username = configRoot["ThingsBoard:TenantUsername"];
                var password = configRoot["ThingsBoard:TenantPassword"];

                // 🔐 Login silently
                var jwt = await AuthClient.LoginAsync(
                    baseUrl, username, password);

                lblStatus.Text = "Status: Provisioning devices...";

                var uri = new Uri(baseUrl);

                var config = new SimulatorConfig
                {
                    TbHost = uri.Host,
                    MqttPort = int.Parse(
                        configRoot["Simulator:DefaultMqttPort"]),
                    TenantJwt = jwt,
                    DeviceCount = int.Parse(txtDeviceCount.Text),
                    IntervalSeconds = int.Parse(txtInterval.Text),
                    PayloadTemplate = txtPayload.Text
                };

                var api = new ThingsBoardApiClient(config);
                var devices = await DeviceProvisioner
                    .ProvisionAsync(api, config);

                lblStatus.Text = $"Status: Running ({devices.Count} devices)";

                foreach (var device in devices)
                {
                    _ = Task.Run(() =>
                        MqttDeviceWorker.RunAsync(
                            device, config, _cts.Token));
                }
            }
            catch (Exception ex)
            {
                MessageBox.Show(ex.Message, "Error",
                    MessageBoxButtons.OK, MessageBoxIcon.Error);

                ResetUi();
            }
        }


        private void btnStop_Click(object sender, EventArgs e)
        {
            _cts?.Cancel();
            _cts?.Dispose();
            _cts = null;

            ResetUi();
        }

        private void ResetUi()
        {
            btnStart.Enabled = true;
            btnStop.Enabled = false;
            lblStatus.Text = "Status: Stopped";
        }

        private void ValidateJson(string json)
        {
            try
            {
                JsonDocument.Parse(json);
            }
            catch
            {
                throw new Exception("Payload is not valid JSON");
            }
        }
    }
}
