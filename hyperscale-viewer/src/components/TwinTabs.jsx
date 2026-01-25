import React, { useRef, useState } from 'react'
export default function TwinTabs({ activeTab, onChange }) {
  const tabStyle = (tab) => ({
    padding: '12px 20px',
    cursor: 'pointer',
    background: activeTab === tab ? '#1f2937' : '#0b1220',
    color: '#fff',
    borderBottom: activeTab === tab ? '2px solid #38bdf8' : 'none',
  })

  return (
    <div style={{ display: 'flex', background: '#020617' }}>
      <div style={tabStyle('design')} onClick={() => onChange('design')}>
        Design
      </div>
      <div style={tabStyle('sustainability')} onClick={() => onChange('sustainability')}>
        Sustainability
      </div>
    </div>
  )
}
