using System.Windows.Forms;
using System.Drawing;

namespace Simulator
{
    partial class MainForm
    {
        private System.ComponentModel.IContainer components = null;

        private TextBox txtDeviceCount;
        private TextBox txtInterval;
        private TextBox txtPayload;

        private Button btnStart;
        private Button btnStop;
        private Label lblStatus;

        protected override void Dispose(bool disposing)
        {
            if (disposing && (components != null))
                components.Dispose();
            base.Dispose(disposing);
        }

        private void InitializeComponent()
        {
            this.txtDeviceCount = new TextBox();
            this.txtInterval = new TextBox();
            this.txtPayload = new TextBox();

            this.btnStart = new Button();
            this.btnStop = new Button();
            this.lblStatus = new Label();

            this.SuspendLayout();

            // Form
            this.Text = "Civit Sustain Load Simulator";
            this.Size = new Size(700, 520);
            this.StartPosition = FormStartPosition.CenterScreen;

            // Number of Devices
            Controls.Add(new Label
            {
                Text = "Number of Devices",
                Left = 20,
                Top = 20,
                Width = 160
            });

            txtDeviceCount.SetBounds(200, 20, 200, 25);
            txtDeviceCount.Text = "1";
            Controls.Add(txtDeviceCount);

            // Publish Interval
            Controls.Add(new Label
            {
                Text = "Publish Interval (sec)",
                Left = 20,
                Top = 55,
                Width = 160
            });

            txtInterval.SetBounds(200, 55, 200, 25);
            txtInterval.Text = "10";
            Controls.Add(txtInterval);

            // Payload Label
            Controls.Add(new Label
            {
                Text = "Telemetry Payload (JSON)",
                Left = 20,
                Top = 95,
                Width = 250
            });

            // Payload TextBox
            txtPayload.SetBounds(20, 120, 640, 250);
            txtPayload.Multiline = true;
            txtPayload.ScrollBars = ScrollBars.Vertical;
            txtPayload.Font = new Font("Consolas", 10);
            txtPayload.Text =
@"{
  ""rack_id"": ""{device}"",
  ""cpu_util"": ""{rand}"",
  ""power_kw"": 3.2,
  ""ts"": ""{ts}""
}";
            Controls.Add(txtPayload);

            // Start Button
            btnStart.Text = "Start Simulation";
            btnStart.SetBounds(200, 390, 160, 35);
            btnStart.Click += btnStart_Click;
            Controls.Add(btnStart);

            // Stop Button
            btnStop.Text = "Stop";
            btnStop.SetBounds(380, 390, 100, 35);
            btnStop.Enabled = false;
            btnStop.Click += btnStop_Click;
            Controls.Add(btnStop);

            // Status Label
            lblStatus.Text = "Status: Idle";
            lblStatus.SetBounds(20, 440, 640, 25);
            Controls.Add(lblStatus);

            this.ResumeLayout(false);
        }
    }
}
