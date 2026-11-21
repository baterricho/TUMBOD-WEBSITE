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
  payload?: Array<{ payload?: DailyMarineWeather }>
  locale: 'fil' | 'en'
}

function FishingCustomTooltip({ active, payload, locale }: CustomTooltipProps) {
  if (!active || !payload || !payload.length) return null

  const fil = locale === 'fil'
  const data = payload[0]?.payload
  if (!data) return null

  const wave = data.waveHeightMaxM
  const wind = data.windMaxKph

  let fishingRatingFil = 'Maganda para sa Pagpalaot'
  let fishingRatingEn = 'Favorable for Fishing'
  let badgeClass = 'chip chip--open'

  if (wave >= 1.5 || wind >= 32) {
    fishingRatingFil = 'Delikado — Bawal Pumalaot'
    fishingRatingEn = 'Hazardous — No Sail'
    badgeClass = 'chip chip--danger'
  } else if (wave >= 1.0 || wind >= 20) {
    fishingRatingFil = 'Mag-ingat — Choppy ang Kipot'
    fishingRatingEn = 'Caution — Moderate Chop'
    badgeClass = 'chip chip--warning'
  }

  return (
    <div
      style={{
        background: 'var(--surface-raised)',
        color: 'var(--ink)',
        padding: '12px 14px',
        borderRadius: '8px',
        border: '1px solid var(--line-strong)',
        boxShadow: 'var(--shadow-lg)',
        fontSize: '12px',
        maxWidth: '260px',
      }}
    >
      <div style={{ fontWeight: 700, fontSize: '13px', marginBottom: '2px', color: 'var(--ink-strong)' }}>
        {fil ? data.dayNameFil : data.dayNameEn} ({data.date})
      </div>
      <div style={{ color: 'var(--ink-muted)', marginBottom: '8px' }}>
        {fil ? data.weatherDescFil : data.weatherDescEn}
      </div>

      <div className={badgeClass} style={{ marginBottom: '10px' }}>
        {fil ? fishingRatingFil : fishingRatingEn}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
        <div>
          <span style={{ color: 'var(--ink-muted)', display: 'block', fontSize: '11px' }}>
            {fil ? 'Taas ng Alon' : 'Max Wave'}
          </span>
          <strong className="figure" style={{ color: 'var(--interactive)', fontSize: '13px' }}>
            {data.waveHeightMaxM.toFixed(1)} m
          </strong>
        </div>
        <div>
          <span style={{ color: 'var(--ink-muted)', display: 'block', fontSize: '11px' }}>
            {fil ? 'Hangin' : 'Max Wind'}
          </span>
          <strong className="figure" style={{ color: 'var(--accent-strong)', fontSize: '13px' }}>
            {Math.round(data.windMaxKph)} km/h
          </strong>
        </div>
        <div>
          <span style={{ color: 'var(--ink-muted)', display: 'block', fontSize: '11px' }}>
            {fil ? 'Temperatura' : 'Temp Range'}
          </span>
          <strong className="figure" style={{ color: 'var(--status-open)', fontSize: '13px' }}>
            {Math.round(data.tempMin)}° – {Math.round(data.tempMax)}°C
          </strong>
        </div>
        <div>
          <span style={{ color: 'var(--ink-muted)', display: 'block', fontSize: '11px' }}>
            {fil ? 'Tsansa ng Ulan' : 'Rain Chance'}
          </span>
          <strong className="figure" style={{ color: 'var(--ink-strong)', fontSize: '13px' }}>
            {data.precipProbMax}%
          </strong>
        </div>
      </div>
    </div>
  )
}

export function FishingWeatherChart({ locale, dailyData }: FishingWeatherChartProps) {
  const fil = locale === 'fil'
  const [activeMetric, setActiveMetric] = useState<'sea' | 'rainTemp'>('sea')

  const fiveDayData = (dailyData && dailyData.length > 0 ? dailyData : []).slice(0, 5)
  const maxWaveNext5Days = Math.max(...fiveDayData.map((d) => d.waveHeightMaxM || 0), 0)

  if (fiveDayData.length === 0) {
    return (
      <div className="empty-state" id="fishing-forecast-trends">
        <p className="empty-state__title">
          {fil ? 'Walang magagamit na 5-araw na datos' : '5-Day Forecast Unavailable'}
        </p>
        <p className="empty-state__desc">
          {fil
            ? 'Hindi makakonekta sa marine telemetry ngayon. Sundin ang opisyal na abiso ng BDRRMC at Coast Guard.'
            : 'Unable to load marine telemetry right now. Follow official BDRRMC and Coast Guard advisories.'}
        </p>
      </div>
    )
  }

  return (
    <div
      id="fishing-forecast-trends"
      style={{
        background: 'var(--surface-raised)',
        border: '1px solid var(--line)',
        borderRadius: 'var(--r-card)',
        padding: '20px',
        boxShadow: 'var(--shadow-sm)',
        fontFamily: 'inherit',
        color: 'var(--ink)',
      }}
    >
      {/* Header & Segmented Metric Switcher */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          flexWrap: 'wrap',
          gap: '12px',
          marginBottom: '16px',
        }}
      >
        <div>
          <span className="chip chip--info" style={{ marginBottom: '6px' }}>
            {fil ? '5-Araw na Ulat sa Tuluran Strait' : '5-Day Marine Trends'}
          </span>
          <h3
            style={{
              margin: '4px 0 0',
              fontSize: '18px',
              fontWeight: 700,
              color: 'var(--ink-strong)',
            }}
          >
            {fil
              ? 'Talaan ng Panahon at Alon para sa Mangingisda'
              : '5-Day Marine & Fishing Weather Trends'}
          </h3>
          <p style={{ margin: '4px 0 0', fontSize: '13px', color: 'var(--ink-muted)' }}>
            {fil
              ? 'Pagsusuri sa taas ng alon, bilis ng hangin, at ulan sa Look ng Taytay'
              : 'Forecasting wave swells, wind speeds, and precipitation for local banca operations'}
          </p>
        </div>

        <div
          role="group"
          aria-label={fil ? 'Sukatan ng tsart' : 'Chart view'}
          style={{
            display: 'inline-flex',
            backgroundColor: 'var(--surface-sunken)',
            padding: '4px',
            borderRadius: 'var(--r-inner)',
            border: '1px solid var(--line)',
            gap: '4px',
          }}
        >
          <button
            type="button"
            aria-pressed={activeMetric === 'sea'}
            onClick={() => setActiveMetric('sea')}
            style={{
              border: activeMetric === 'sea' ? '1px solid var(--line)' : '1px solid transparent',
              background: activeMetric === 'sea' ? 'var(--surface-raised)' : 'transparent',
              color: activeMetric === 'sea' ? 'var(--ink-strong)' : 'var(--ink-muted)',
              fontWeight: 700,
              fontSize: '12px',
              minHeight: '36px',
              padding: '6px 12px',
              borderRadius: 'var(--radius-sm)',
              cursor: 'pointer',
              boxShadow: activeMetric === 'sea' ? 'var(--shadow-sm)' : 'none',
            }}
          >
            {fil ? 'Alon at Hangin' : 'Waves & Wind'}
          </button>
          <button
            type="button"
            aria-pressed={activeMetric === 'rainTemp'}
            onClick={() => setActiveMetric('rainTemp')}
            style={{
              border: activeMetric === 'rainTemp' ? '1px solid var(--line)' : '1px solid transparent',
              background: activeMetric === 'rainTemp' ? 'var(--surface-raised)' : 'transparent',
              color: activeMetric === 'rainTemp' ? 'var(--ink-strong)' : 'var(--ink-muted)',
              fontWeight: 700,
              fontSize: '12px',
              minHeight: '36px',
              padding: '6px 12px',
              borderRadius: 'var(--radius-sm)',
              cursor: 'pointer',
              boxShadow: activeMetric === 'rainTemp' ? 'var(--shadow-sm)' : 'none',
            }}
          >
            {fil ? 'Ulan at Temperatura' : 'Rain & Temp'}
          </button>
        </div>
      </div>

      {/* Recharts Visualization */}
      <div style={{ width: '100%', height: '300px', marginTop: '8px' }}>
        <ResponsiveContainer width="100%" height="100%">
          {activeMetric === 'sea' ? (
            <ComposedChart data={fiveDayData} margin={{ top: 18, right: 18, bottom: 16, left: 0 }}>
              <defs>
                <linearGradient id="waveGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#0284c7" stopOpacity={0.28} />
                  <stop offset="95%" stopColor="#0284c7" stopOpacity={0.02} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--line)" />
              <XAxis
                dataKey={fil ? 'dayNameFil' : 'dayNameEn'}
                tick={{ fill: 'var(--ink-muted)', fontSize: 12, fontWeight: 600 }}
                tickLine={{ stroke: 'var(--line)' }}
                axisLine={{ stroke: 'var(--line)' }}
              />
              <YAxis
                yAxisId="wave"
                orientation="left"
                domain={[0, (dataMax: number) => Math.max(Math.ceil(dataMax * 1.3), 3)]}
                tick={{ fill: 'var(--interactive)', fontSize: 11, fontWeight: 600 }}
                unit=" m"
              />
              <YAxis
                yAxisId="wind"
                orientation="right"
                domain={[0, (dataMax: number) => Math.max(Math.ceil(dataMax * 1.2), 40)]}
                tick={{ fill: 'var(--accent-strong)', fontSize: 11, fontWeight: 600 }}
                unit=" kph"
              />
              <Tooltip content={<FishingCustomTooltip locale={locale} />} />
              <Legend wrapperStyle={{ paddingTop: 8, fontSize: 12, fontWeight: 600 }} />

              <ReferenceLine
                yAxisId="wave"
                y={1.5}
                stroke="#dc2626"
                strokeDasharray="4 4"
                strokeWidth={1.5}
                label={{
                  value: fil ? 'Bawal <3 GT (1.5m)' : 'No-Sail <3 GT (1.5m)',
                  position: 'insideTopLeft',
                  fill: '#dc2626',
                  fontSize: 10,
                  fontWeight: 700,
                }}
              />
              <ReferenceLine
                yAxisId="wave"
                y={1.0}
                stroke="#d97706"
                strokeDasharray="3 3"
                strokeWidth={1.2}
                label={{
                  value: fil ? 'Maliliit na bangka (1.0m)' : 'Small craft (1.0m)',
                  position: 'insideBottomLeft',
                  fill: '#d97706',
                  fontSize: 10,
                  fontWeight: 700,
                }}
              />

              <Area
                yAxisId="wave"
                type="monotone"
                dataKey="waveHeightMaxM"
                name={fil ? 'Taas ng Alon (m)' : 'Wave Height (m)'}
                stroke="#0284c7"
                strokeWidth={2.5}
                fillOpacity={1}
                fill="url(#waveGradient)"
                dot={{ r: 3.5, stroke: '#0284c7', strokeWidth: 2, fill: 'var(--surface-raised)' }}
                activeDot={{ r: 5.5, stroke: '#0284c7', strokeWidth: 2, fill: '#38bdf8' }}
              />

              <Line
                yAxisId="wind"
                type="monotone"
                dataKey="windMaxKph"
                name={fil ? 'Lakas ng Hangin (km/h)' : 'Max Wind Speed (km/h)'}
                stroke="#d97706"
                strokeWidth={2.5}
                dot={{ r: 3.5, stroke: '#d97706', strokeWidth: 2, fill: 'var(--surface-raised)' }}
                activeDot={{ r: 5.5, stroke: '#d97706', strokeWidth: 2, fill: '#fbbf24' }}
              />
            </ComposedChart>
          ) : (
            <ComposedChart data={fiveDayData} margin={{ top: 18, right: 18, bottom: 16, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--line)" />
              <XAxis
                dataKey={fil ? 'dayNameFil' : 'dayNameEn'}
                tick={{ fill: 'var(--ink-muted)', fontSize: 12, fontWeight: 600 }}
                tickLine={{ stroke: 'var(--line)' }}
                axisLine={{ stroke: 'var(--line)' }}
              />
              <YAxis
                yAxisId="temp"
                orientation="left"
                domain={[20, 36]}
                tick={{ fill: 'var(--status-open)', fontSize: 11, fontWeight: 600 }}
                unit="°C"
              />
              <YAxis
                yAxisId="rain"
                orientation="right"
                domain={[0, 100]}
                tick={{ fill: 'var(--interactive)', fontSize: 11, fontWeight: 600 }}
                unit="%"
              />
              <Tooltip content={<FishingCustomTooltip locale={locale} />} />
              <Legend wrapperStyle={{ paddingTop: 8, fontSize: 12, fontWeight: 600 }} />

              <Bar
                yAxisId="rain"
                dataKey="precipProbMax"
                name={fil ? 'Tsansa ng Ulan (%)' : 'Rain Probability (%)'}
                fill="#0284c7"
                fillOpacity={0.35}
                radius={[4, 4, 0, 0]}
                barSize={28}
              />

              <Line
                yAxisId="temp"
                type="monotone"
                dataKey="tempMax"
                name={fil ? 'Mataas na Temp (°C)' : 'Max Temp (°C)'}
                stroke="#dc2626"
                strokeWidth={2}
                dot={{ r: 3, fill: '#dc2626' }}
              />
              <Line
                yAxisId="temp"
                type="monotone"
                dataKey="tempMin"
                name={fil ? 'Mababang Temp (°C)' : 'Min Temp (°C)'}
                stroke="#16a34a"
                strokeWidth={2}
                dot={{ r: 3, fill: '#16a34a' }}
              />
            </ComposedChart>
          )}
        </ResponsiveContainer>
      </div>

      {/* 5-Day Summary Deck */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
          gap: '10px',
          marginTop: '16px',
          paddingTop: '16px',
          borderTop: '1px solid var(--line)',
        }}
      >
        {fiveDayData.map((day, idx) => {
          const wave = day.waveHeightMaxM
          const wind = day.windMaxKph
          const isDanger = wave >= 1.5 || wind >= 32
          const isCaution = wave >= 1.0 || wind >= 20

          const badgeClass = isDanger ? 'chip chip--danger' : isCaution ? 'chip chip--warning' : 'chip chip--open'
          const labelText = isDanger
            ? fil ? 'Bawal' : 'No Sail'
            : isCaution
              ? fil ? 'Mag-ingat' : 'Caution'
              : fil ? 'Ligtas' : 'Safe'

          return (
            <div
              key={day.date || idx}
              style={{
                backgroundColor: 'var(--surface)',
                border: '1px solid var(--line)',
                borderRadius: 'var(--r-inner)',
                padding: '10px',
                display: 'grid',
                gap: '6px',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '4px' }}>
                <strong style={{ fontSize: '12px', color: 'var(--ink-strong)' }}>
                  {fil ? day.dayNameFil : day.dayNameEn}
                </strong>
                <span className={badgeClass} style={{ padding: '1px 6px', fontSize: '10px' }}>
                  {labelText}
                </span>
              </div>

              <div style={{ fontSize: '11px', color: 'var(--ink-muted)' }}>
                {fil ? day.weatherDescFil : day.weatherDescEn}
              </div>

              <div
                className="figure"
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  fontSize: '11px',
                  paddingTop: '4px',
                  borderTop: '1px solid var(--line)',
                }}
              >
                <span style={{ color: 'var(--interactive)', fontWeight: 700 }}>
                  {day.waveHeightMaxM.toFixed(1)}m
                </span>
                <span style={{ color: 'var(--accent-strong)', fontWeight: 700 }}>
                  {Math.round(day.windMaxKph)} km/h
                </span>
              </div>
            </div>
          )
        })}
      </div>

      {/* Provenance Footnote */}
      <div
        style={{
          marginTop: '14px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          fontSize: '11px',
          color: 'var(--ink-muted)',
        }}
      >
        <span
          aria-hidden="true"
          style={{
            display: 'inline-block',
            width: '8px',
            height: '8px',
            borderRadius: '9999px',
            backgroundColor: maxWaveNext5Days >= 1.5 ? 'var(--alert-emergency)' : 'var(--status-open)',
            flexShrink: 0,
          }}
        />
        <span>
          {fil
            ? 'Batay sa Open-Meteo Marine Models para sa Tuluran Island. Sumunod lagi sa Coast Guard Sub-station Taytay.'
            : 'Based on Open-Meteo marine models for Tuluran Island. Always follow Philippine Coast Guard Taytay advisories.'}
        </span>
      </div>
    </div>
  )
}

export default FishingWeatherChart
