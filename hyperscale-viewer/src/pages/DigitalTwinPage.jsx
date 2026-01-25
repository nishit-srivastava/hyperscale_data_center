import React, { useRef, useState } from 'react'
import TwinScene from '../components/TwinScene'
import TwinTabs from '../components/TwinTabs'
import DesignPanel from '../components/panels/DesignPanel'
import SustainabilityPanel from '../components/panels/SustainabilityPanel'

export default function DigitalTwinPage() {
  const [activeTab, setActiveTab] = useState('design')
  const controlsRef = useRef()

  return (
    <div className="app-root">
      <header className="app-header">
        <h1>Hyperscale Data Center — Digital Twin</h1>
      </header>

      <TwinTabs activeTab={activeTab} onChange={setActiveTab} />

      <div className="content">
        {/* 3D Twin */}
        <div className="viewer">
          <TwinScene activeTab={activeTab} controlsRef={controlsRef} />
        </div>

        {/* Right Context Panel */}
        <div className="charts">
          {activeTab === 'design' && <DesignPanel />}
          {activeTab === 'sustainability' && <SustainabilityPanel />}
        </div>
      </div>
    </div>
  )
}
