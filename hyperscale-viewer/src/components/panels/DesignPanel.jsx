import React, { useRef, useState } from 'react'
import LiveOperationsPanel from '../LiveOperationsPanel'
export default function DesignPanel() {
  return (
    // <div style={{ padding: '16px', color: '#fff' }}>
    //   <h3>Live Operational State</h3>

    //   <p>Ambient Temp: 25.4 °C</p>
    //   <p>Inlet Temp: 31.2 °C</p>
    //   <p>Exhaust Temp: 43.0 °C</p>
    //   <p>IT Power: 3.24 kW</p>

    //   <hr />

    //   <h4>Anomaly Status</h4>
    //   <p style={{ color: '#22c55e' }}>Normal Operation</p>
    // </div>
     
    <div style={{ height: '100%', overflow: 'auto' }}>
      <LiveOperationsPanel />
   
    </div>
 
  )
}
