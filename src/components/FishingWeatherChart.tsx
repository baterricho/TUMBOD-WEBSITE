import React, { useState } from 'react'
import {
  ResponsiveContainer,
  ComposedChart,
  Line,
  Bar,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ReferenceLine,
} from 'recharts'
import type { DailyMarineWeather } from '@/lib/weather'

export interface FishingWeatherChartProps {
  locale: 'fil' | 'en'
  dailyData: DailyMarineWeather[]
}

interface CustomTooltipProps {
  active?: boolean
  payload?: any[]
  locale: 'fil' | 'en'
}

function FishingCustomTooltip({ active, payload, locale }: CustomTooltipProps) {
  if (!active || !payload || !payload.length) return null

  const fil = locale === 'fil'
  const data = payload[0]?.payload as DailyMarineWeather | undefined
  if (!data) return null

  const wave = data.waveHeightMaxM
  const wind = data.windMaxKph

  let fishingRatingFil = 'Maganda para sa Pagpalaot'
  let fishingRatingEn = 'Favorable for Fishing'
  let ratingColor = '#10b981'

  if (wave >= 1.5 || wind >= 32) {
    fishingRatingFil = 'Delikado — Bawal Pumalaot'
    fishingRatingEn = 'Hazardous — No Sail'
    ratingColor = '#ef4444'
  } else if (wave >= 1.0 || wind >= 20) {
    fishingRatingFil = 'Mag-ingat — Choppy ang Kipot'
    fishingRatingEn = 'Caution — Moderate Chop'
    ratingColor = '#f59e0b'
  }

  return (
    <div
      style={{
        background: '#0f172a',
        color: '#f8fafc',
        padding: '12px 16px',
        borderRadius: '8px',
        border: '1px solid #334155',
        boxShadow: '0 8px 24px rgba(0,0,0,0.4)',
        fontSize: '12px',
        maxWidth: '260px',
      }}
    >
      <div style={{ fontWeight: 800, fontSize: '14px', marginBottom: '4px', color: '#38bdf8' }}>
        {fil ? data.dayNameFil : data.dayNameEn} ({data.date})
      </div>
      <div style={{ color: '#cbd5e1', marginBottom: '8px' }}>
        {fil ? data.weatherDescFil : data.weatherDescEn}
      </div>

      <div
        style={{
          display: 'inline-block',
          padding: '3px 8px',
          borderRadius: '9999px',
          backgroundColor: `${ratingColor}22`,
          color: ratingColor,
          fontWeight: 700,
          border: `1px solid ${ratingColor}66`,
          marginBottom: '10px',
        }}
      >
        {fil ? fishingRatingFil : fishingRatingEn}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px' }}>
        <div>
          <span style={{ color: '#94a3b8', display: 'block', fontSize: '11px' }}>
            {fil ? 'Taas ng Alon' : 'Max Wave'}
          </span>
          <strong style={{ color: '#60a5fa', fontSize: '13px' }}>{data.waveHeightMaxM.toFixed(1)} m</strong>
        </div>
        <div>
          <span style={{ color: '#94a3b8', display: 'block', fontSize: '11px' }}>
            {fil ? 'Hangin' : 'Max Wind'}
          </span>
          <strong style={{ color: '#f59e0b', fontSize: '13px' }}>{Math.round(data.windMaxKph)} km/h</strong>
        </div>
        <div>
          <span style={{ color: '#94a3b8', display: 'block', fontSize: '11px' }}>
            {fil ? 'Temperatura' : 'Temp Range'}
          </span>
          <strong style={{ color: '#34d399', fontSize: '13px' }}>
            {Math.round(data.tempMin)}° - {Math.round(data.tempMax)}°C
          </strong>
        </div>
        <div>
          <span style={{ color: '#94a3b8', display: 'block', fontSize: '11px' }}>
            {fil ? 'Tsansa ng Ulan' : 'Rain Chance'}
          </span>
          <strong style={{ color: '#a78bfa', fontSize: '13px' }}>{data.precipProbMax}%</strong>
        </div>
      </div>
    </div>
  )
}

export function FishingWeatherChart({ locale, dailyData }: FishingWeatherChartProps) {
  const fil = locale === 'fil'
  const [activeMetric, setActiveMetric] = useState<'sea' | 'rainTemp'>('sea')

  // Use the 5-day forecast slice
  const fiveDayData = (dailyData && dailyData.length > 0 ? dailyData : []).slice(0, 5)

  // Determine overall fishing advisories
  const maxWaveNext5Days = Math.max(...fiveDayData.map((d) => d.waveHeightMaxM || 0), 0)

  return (
    <div
      id="fishing-forecast-trends"
      style={{
        background: '#ffffff',
        border: '1px solid #e2e8f0',
        borderRadius: '16px',
        padding: '20px',
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.05)',
        fontFamily: 'inherit',
      }}
    >
      {/* Header with Title and Mode Toggles */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '12px',
          marginBottom: '16px',
        }}
      >
        <div>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              fontSize: '11px',
              fontWeight: 800,
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
              color: '#0369a1',
              backgroundColor: '#e0f2fe',
              padding: '3px 10px',
              borderRadius: '9999px',
              marginBottom: '6px',
            }}
          >
            <span>{fil ? '5-Araw na Ulat sa Tuluran Strait' : '5-Day Marine Trends'}</span>
          </div>
          <h3
            style={{
              margin: 0,
              fontSize: '18px',
              fontWeight: 800,
              color: '#0f172a',
            }}
          >
            {fil
              ? 'Talaan ng Panahon at Alon para sa Mangingisda'
              : '5-Day Marine & Fishing Weather Trends'}
          </h3>
          <p style={{ margin: '4px 0 0', fontSize: '13px', color: '#64748b' }}>
            {fil
              ? 'Pagsusuri sa taas ng alon, bilis ng hangin, at ulan sa Look ng Taytay'
              : 'Forecasting wave swells, wind speeds, and precipitation for local banca operations'}
          </p>
        </div>

        {/* View Switcher Tabs */}
        <div
          style={{
            display: 'inline-flex',
            backgroundColor: '#f1f5f9',
            padding: '3px',
            borderRadius: '10px',
            border: '1px solid #e2e8f0',
          }}
        >
          <button
            type="button"
            onClick={() => setActiveMetric('sea')}
            style={{
              border: 'none',
              background: activeMetric === 'sea' ? '#0284c7' : 'transparent',
              color: activeMetric === 'sea' ? '#ffffff' : '#475569',
              fontWeight: 700,
              fontSize: '12px',
              padding: '6px 14px',
              borderRadius: '8px',
              cursor: 'pointer',
              transition: 'all 0.15s ease',
              boxShadow: activeMetric === 'sea' ? '0 2px 6px rgba(2, 132, 199, 0.3)' : 'none',
            }}
          >
            {fil ? 'Alon at Hangin (Sea State)' : 'Waves & Wind'}
          </button>
          <button
            type="button"
            onClick={() => setActiveMetric('rainTemp')}
            style={{
              border: 'none',
              background: activeMetric === 'rainTemp' ? '#0284c7' : 'transparent',
              color: activeMetric === 'rainTemp' ? '#ffffff' : '#475569',
              fontWeight: 700,
              fontSize: '12px',
              padding: '6px 14px',
              borderRadius: '8px',
              cursor: 'pointer',
              transition: 'all 0.15s ease',
              boxShadow: activeMetric === 'rainTemp' ? '0 2px 6px rgba(2, 132, 199, 0.3)' : 'none',
            }}
          >
            {fil ? 'Ulan at Temperatura' : 'Rain & Temperature'}
          </button>
        </div>
      </div>

      {/* Recharts Chart Area */}
      <div style={{ width: '100%', height: '320px', marginTop: '10px' }}>
        <ResponsiveContainer width="100%" height="100%">
          {activeMetric === 'sea' ? (
            <ComposedChart
              data={fiveDayData}
              margin={{ top: 20, right: 20, bottom: 20, left: 0 }}
            >
              <defs>
                <linearGradient id="waveGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#0284c7" stopOpacity={0.35} />
                  <stop offset="95%" stopColor="#0284c7" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
              <XAxis
                dataKey={fil ? 'dayNameFil' : 'dayNameEn'}
                tick={{ fill: '#475569', fontSize: 12, fontWeight: 600 }}
                tickLine={{ stroke: '#cbd5e1' }}
                axisLine={{ stroke: '#cbd5e1' }}
              />
              {/* Left Y Axis for Wave Height in meters */}
              <YAxis
                yAxisId="wave"
                orientation="left"
                domain={[0, (dataMax: number) => Math.max(Math.ceil(dataMax * 1.3), 3)]}
                tick={{ fill: '#0284c7', fontSize: 11, fontWeight: 700 }}
                unit=" m"
                label={{
                  value: fil ? 'Alon (m)' : 'Wave (m)',
                  angle: -90,
                  position: 'insideLeft',
                  fill: '#0284c7',
                  fontSize: 11,
                  fontWeight: 700,
                  dy: 25,
                }}
              />
              {/* Right Y Axis for Wind Speed in km/h */}
              <YAxis
                yAxisId="wind"
                orientation="right"
                domain={[0, (dataMax: number) => Math.max(Math.ceil(dataMax * 1.2), 40)]}
                tick={{ fill: '#d97706', fontSize: 11, fontWeight: 700 }}
                unit=" km/h"
                label={{
                  value: fil ? 'Hangin (km/h)' : 'Wind (km/h)',
                  angle: 90,
                  position: 'insideRight',
                  fill: '#d97706',
                  fontSize: 11,
                  fontWeight: 700,
                  dy: 40,
                }}
              />
              <Tooltip content={<FishingCustomTooltip locale={locale} />} />
              <Legend wrapperStyle={{ paddingBottom: 10, fontSize: 12, fontWeight: 600 }} />

              {/* Safety Reference Lines */}
              <ReferenceLine
                yAxisId="wave"
                y={1.5}
                stroke="#ef4444"
                strokeDasharray="4 4"
                strokeWidth={1.5}
                label={{
                  value: fil ? 'Bawal sa <3 GT (1.5m)' : 'No-Sail <3 GT (1.5m)',
                  position: 'insideTopLeft',
                  fill: '#dc2626',
                  fontSize: 10,
                  fontWeight: 700,
                }}
              />
              <ReferenceLine
                yAxisId="wave"
                y={1.0}
                stroke="#f59e0b"
                strokeDasharray="3 3"
                strokeWidth={1.2}
                label={{
                  value: fil ? 'Limitasyon ng Maliliit (1.0m)' : 'Small Banca Limit (1.0m)',
                  position: 'insideBottomLeft',
                  fill: '#b45309',
                  fontSize: 10,
                  fontWeight: 700,
                }}
              />

              {/* Wave Swell Area */}
              <Area
                yAxisId="wave"
                type="monotone"
                dataKey="waveHeightMaxM"
                name={fil ? 'Taas ng Alon (m)' : 'Wave Height (m)'}
                stroke="#0284c7"
                strokeWidth={3}
                fillOpacity={1}
                fill="url(#waveGradient)"
                dot={{ r: 4, stroke: '#0284c7', strokeWidth: 2, fill: '#ffffff' }}
                activeDot={{ r: 6, stroke: '#0284c7', strokeWidth: 2, fill: '#38bdf8' }}
              />

              {/* Wind Speed Line */}
              <Line
                yAxisId="wind"
                type="monotone"
                dataKey="windMaxKph"
                name={fil ? 'Lakas ng Hangin (km/h)' : 'Max Wind Speed (km/h)'}
                stroke="#d97706"
                strokeWidth={2.5}
                dot={{ r: 4, stroke: '#d97706', strokeWidth: 2, fill: '#ffffff' }}
                activeDot={{ r: 6, stroke: '#d97706', strokeWidth: 2, fill: '#fbbf24' }}
              />
            </ComposedChart>
          ) : (
            <ComposedChart
              data={fiveDayData}
              margin={{ top: 20, right: 20, bottom: 20, left: 0 }}
            >
              <defs>
                <linearGradient id="rainGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#818cf8" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="#c7d2fe" stopOpacity={0.3} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
              <XAxis
                dataKey={fil ? 'dayNameFil' : 'dayNameEn'}
                tick={{ fill: '#475569', fontSize: 12, fontWeight: 600 }}
                tickLine={{ stroke: '#cbd5e1' }}
                axisLine={{ stroke: '#cbd5e1' }}
              />
              <YAxis
                yAxisId="temp"
                orientation="left"
                domain={[20, 36]}
                tick={{ fill: '#059669', fontSize: 11, fontWeight: 700 }}
                unit="°C"
                label={{
                  value: 'Temp (°C)',
                  angle: -90,
                  position: 'insideLeft',
                  fill: '#059669',
                  fontSize: 11,
                  fontWeight: 700,
                  dy: 25,
                }}
              />
              <YAxis
                yAxisId="rain"
                orientation="right"
                domain={[0, 100]}
                tick={{ fill: '#6366f1', fontSize: 11, fontWeight: 700 }}
                unit="%"
                label={{
                  value: fil ? 'Ulan (%)' : 'Rain (%)',
                  angle: 90,
                  position: 'insideRight',
                  fill: '#6366f1',
                  fontSize: 11,
                  fontWeight: 700,
                  dy: 25,
                }}
              />
              <Tooltip content={<FishingCustomTooltip locale={locale} />} />
              <Legend wrapperStyle={{ paddingBottom: 10, fontSize: 12, fontWeight: 600 }} />

              {/* Rain Chance Bar */}
              <Bar
                yAxisId="rain"
                dataKey="precipProbMax"
                name={fil ? 'Tsansa ng Ulan (%)' : 'Rain Probability (%)'}
                fill="url(#rainGradient)"
                radius={[6, 6, 0, 0]}
                barSize={32}
              />

              {/* Temp Max and Min Lines */}
              <Line
                yAxisId="temp"
                type="monotone"
                dataKey="tempMax"
                name={fil ? 'Mataas na Temp (°C)' : 'Max Temp (°C)'}
                stroke="#ef4444"
                strokeWidth={2}
                dot={{ r: 3, fill: '#ef4444' }}
              />
              <Line
                yAxisId="temp"
                type="monotone"
                dataKey="tempMin"
                name={fil ? 'Mababang Temp (°C)' : 'Min Temp (°C)'}
                stroke="#059669"
                strokeWidth={2}
                dot={{ r: 3, fill: '#059669' }}
              />
            </ComposedChart>
          )}
        </ResponsiveContainer>
      </div>

      {/* 5-Day Card Summary Deck with Fishing Guidance */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
          gap: '10px',
          marginTop: '16px',
          paddingTop: '16px',
          borderTop: '1px solid #f1f5f9',
        }}
      >
        {fiveDayData.map((day, idx) => {
          const wave = day.waveHeightMaxM
          const wind = day.windMaxKph
          const isDanger = wave >= 1.5 || wind >= 32
          const isCaution = wave >= 1.0 || wind >= 20

          const badgeBg = isDanger ? '#fee2e2' : isCaution ? '#fef3c7' : '#dcfce7'
          const badgeColor = isDanger ? '#b91c1c' : isCaution ? '#b45309' : '#15803d'
          const labelText = isDanger
            ? fil ? 'Bawal Pumalaot' : 'No Sail'
            : isCaution
              ? fil ? 'Mag-ingat' : 'Caution'
              : fil ? 'Ligtas Pumalaot' : 'Favorable'

          return (
            <div
              key={day.date || idx}
              style={{
                backgroundColor: '#f8fafc',
                border: '1px solid #e2e8f0',
                borderRadius: '10px',
                padding: '10px',
                display: 'flex',
                flexDirection: 'column',
                gap: '4px',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <strong style={{ fontSize: '12px', color: '#1e293b' }}>
                  {fil ? day.dayNameFil : day.dayNameEn}
                </strong>
                <span
                  style={{
                    fontSize: '10px',
                    fontWeight: 700,
                    padding: '2px 6px',
                    borderRadius: '9999px',
                    backgroundColor: badgeBg,
                    color: badgeColor,
                  }}
                >
                  {labelText}
                </span>
              </div>

              <div style={{ fontSize: '11px', color: '#64748b' }}>
                {fil ? day.weatherDescFil : day.weatherDescEn}
              </div>

              <div style={{ marginTop: '4px', display: 'flex', justifyContent: 'space-between', fontSize: '11px' }}>
                <span style={{ color: '#0369a1', fontWeight: 700 }}>
                  ~{day.waveHeightMaxM.toFixed(1)}m alon
                </span>
                <span style={{ color: '#b45309', fontWeight: 700 }}>
                  {Math.round(day.windMaxKph)}kph
                </span>
              </div>
            </div>
          )
        })}
      </div>

      {/* Advisory Footnote */}
      <div
        style={{
          marginTop: '12px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          fontSize: '11px',
          color: '#64748b',
        }}
      >
        <span
          style={{
            display: 'inline-block',
            width: '8px',
            height: '8px',
            borderRadius: '9999px',
            backgroundColor: maxWaveNext5Days >= 1.5 ? '#ef4444' : '#10b981',
          }}
        />
        <span>
          {fil
            ? 'Batay sa Open-Meteo High-Resolution Marine Models para sa Tuluran Island (10.93°N, 119.55°E). Sumunod lagi sa Coast Guard Sub-station Taytay.'
            : 'Based on high-resolution Open-Meteo marine models for Tuluran Island (10.93°N, 119.55°E). Always heed Philippine Coast Guard Taytay advisories.'}
        </span>
      </div>
    </div>
  )
}

export default FishingWeatherChart
