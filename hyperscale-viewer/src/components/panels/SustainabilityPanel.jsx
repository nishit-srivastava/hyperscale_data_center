import React, { useRef, useState } from 'react'
export default function SustainabilityPanel() {
  return (
    <div style={{ padding: '16px', color: '#fff' }}>
      <h3>What-if Simulation</h3>

      <label>CRAC Setpoint Change</label>
      <input type="number" defaultValue={2} />

      <label>Demand Multiplier</label>
      <input type="number" step="0.1" defaultValue={1.0} />

      <button style={{ marginTop: '12px' }}>Simulate</button>

      <hr />

      <h4>Predicted Impact</h4>
      <p>Energy Saving: −8.2 kWh</p>
      <p>Risk Level: LOW</p>
    </div>
  )
}
