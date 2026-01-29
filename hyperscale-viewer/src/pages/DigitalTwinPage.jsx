import React, { useRef, useState } from 'react'
import GLBViewer from '../components/GLBViewer'
import TwinTabs from '../components/TwinTabs'
import DesignPanel from '../components/panels/DesignPanel'
import SustainabilityPanel from '../components/panels/SustainabilityPanel'

export default function DigitalTwinPage() {
  const [activeTab, setActiveTab] = useState('design')

  return (
    <div className="app-root">
      <header className="app-header">
        <h1>Hyperscale Data Center — Digital Twin</h1>
      </header>

      <TwinTabs activeTab={activeTab} onChange={setActiveTab} />

      <div className="content">
        {/* ✅ ONLY Canvas in the app */}
        <div className="viewer">
          <GLBViewer
            glb="/models/server_room.glb"
            showHTML={activeTab === 'design'}
          />
        </div>

        {/* Right side panel */}
        <div className="charts">
          {activeTab === 'design' && <DesignPanel />}
          {activeTab === 'sustainability' && <SustainabilityPanel />}
        </div>
      </div>
    </div>
  )
}
