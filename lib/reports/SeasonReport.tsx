import React from 'react';
import { Document, Line, Page, Path, Rect, StyleSheet, Svg, Text, View } from '@react-pdf/renderer';
import type { ReportData } from './build-report-data';

const colors = {
  ink: '#0B0B14',
  paper: '#F5F0E8',
  mist: '#A9A4B0',
  lilac: '#C8A8E9',
  blue: '#8FB8E8',
  mint: '#A8D8C9',
  muted: '#6B6B7A',
  white: '#FFFFFF',
};

const styles = StyleSheet.create({
  page: {
    backgroundColor: colors.paper,
    padding: 56,
    fontFamily: 'Helvetica',
    color: colors.ink,
  },
  header: {
    marginBottom: 34,
    borderBottomWidth: 0.5,
    borderBottomColor: colors.mist,
    paddingBottom: 22,
  },
  brand: {
    fontFamily: 'Times-Roman',
    fontSize: 28,
    color: colors.ink,
  },
  eyebrow: {
    fontSize: 9,
    letterSpacing: 3,
    textTransform: 'uppercase',
    color: colors.muted,
    marginBottom: 6,
    marginTop: 18,
  },
  title: {
    fontFamily: 'Times-Roman',
    fontSize: 42,
    lineHeight: 1.12,
    color: colors.ink,
  },
  titleItalic: {
    fontFamily: 'Times-Italic',
    fontSize: 42,
  },
  meta: {
    marginTop: 14,
    fontSize: 11,
    color: colors.muted,
  },
  sectionEyebrow: {
    fontSize: 8,
    letterSpacing: 2.5,
    textTransform: 'uppercase',
    color: colors.muted,
    marginBottom: 10,
    marginTop: 26,
  },
  sectionTitle: {
    fontFamily: 'Times-Roman',
    fontSize: 20,
    marginBottom: 14,
    color: colors.ink,
  },
  paragraph: {
    fontSize: 11,
    lineHeight: 1.7,
    color: colors.ink,
    marginBottom: 10,
  },
  statsRow: {
    flexDirection: 'row',
    marginTop: 14,
  },
  statCard: {
    flexGrow: 1,
    flexBasis: 0,
    padding: 14,
    marginRight: 10,
    borderRadius: 8,
    borderWidth: 0.5,
    borderColor: colors.mist,
    backgroundColor: colors.white,
  },
  statValue: {
    fontFamily: 'Times-Roman',
    fontSize: 22,
    color: colors.ink,
  },
  statLabel: {
    fontSize: 8,
    letterSpacing: 1.5,
    textTransform: 'uppercase',
    color: colors.muted,
    marginTop: 4,
  },
  listItem: {
    flexDirection: 'row',
    marginBottom: 7,
    fontSize: 11,
    lineHeight: 1.5,
  },
  bullet: {
    width: 16,
    color: colors.lilac,
  },
  haikuBox: {
    marginTop: 24,
    padding: 24,
    borderRadius: 8,
    backgroundColor: colors.white,
    borderLeftWidth: 3,
    borderLeftColor: colors.lilac,
  },
  haikuLine: {
    fontFamily: 'Times-Italic',
    fontSize: 15,
    lineHeight: 1.8,
    color: colors.ink,
  },
  footer: {
    position: 'absolute',
    bottom: 40,
    left: 56,
    right: 56,
    fontSize: 8,
    color: colors.muted,
    textAlign: 'center',
    letterSpacing: 2,
    textTransform: 'uppercase',
  },
});

function ListItems({ items, empty }: { items: string[]; empty: string }) {
  if (!items.length) {
    return <Text style={styles.paragraph}>{empty}</Text>;
  }

  return (
    <View>
      {items.map((item) => (
        <View key={item} style={styles.listItem}>
          <Text style={styles.bullet}>*</Text>
          <Text>{item}</Text>
        </View>
      ))}
    </View>
  );
}

function TrendChart({ trend }: { trend: Array<{ date: string; storm: number }> }) {
  const width = 480;
  const height = 140;
  const pad = 24;
  if (trend.length < 2) return <Text style={styles.paragraph}>More check-ins will shape this chart.</Text>;

  const xs = trend.map((_, index) => pad + (index * (width - pad * 2)) / (trend.length - 1));
  const ys = trend.map((entry) => height - pad - (entry.storm / 10) * (height - pad * 2));
  const pathD = xs
    .map((x, index) => `${index === 0 ? 'M' : 'L'} ${x.toFixed(1)} ${ys[index].toFixed(1)}`)
    .join(' ');

  return (
    <View>
      <Svg width={width} height={height}>
        {[0, 0.25, 0.5, 0.75, 1].map((tick) => {
          const y = pad + tick * (height - pad * 2);
          return (
            <Line
              key={tick}
              x1={pad}
              y1={y}
              x2={width - pad}
              y2={y}
              stroke={colors.mist}
              strokeWidth={0.35}
            />
          );
        })}
        <Rect x={pad} y={pad} width={width - pad * 2} height={height - pad * 2} fill="#FFFFFF" opacity={0.32} />
        <Path d={pathD} stroke={colors.lilac} strokeWidth={2.2} fill="none" />
        {xs.map((x, index) => (
          <Rect
            key={`${x}-${index}`}
            x={x - 2}
            y={ys[index] - 2}
            width={4}
            height={4}
            fill={index === xs.length - 1 ? colors.blue : colors.lilac}
          />
        ))}
      </Svg>
      <Text style={{ fontSize: 8, color: colors.muted, textAlign: 'center' }}>
        Daily weather intensity, 0 to 10 scale
      </Text>
    </View>
  );
}

export default function SeasonReport({ data }: { data: ReportData }) {
  return (
    <Document>
      <Page size="LETTER" style={styles.page}>
        <View style={styles.header}>
          <Text style={styles.brand}>Luna</Text>
          <Text style={styles.eyebrow}>Season Report</Text>
          <Text style={styles.title}>
            Your 30 days, <Text style={styles.titleItalic}>gently read.</Text>
          </Text>
          <Text style={styles.meta}>
            For {data.userName} | {data.period.label}
          </Text>
        </View>

        <Text style={styles.sectionEyebrow}>The season</Text>
        <Text style={styles.paragraph}>{data.narrative}</Text>

        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{data.stats.total_checkins}</Text>
            <Text style={styles.statLabel}>Whispers shared</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{data.stats.avg_storm}/10</Text>
            <Text style={styles.statLabel}>Average weather</Text>
          </View>
          <View style={[styles.statCard, { marginRight: 0 }]}>
            <Text style={styles.statValue}>{data.top_symptoms[0]?.name ?? '-'}</Text>
            <Text style={styles.statLabel}>Most felt</Text>
          </View>
        </View>

        <Text style={styles.sectionEyebrow}>Your weather, day by day</Text>
        <TrendChart trend={data.trend} />
        <Text style={styles.footer}>Luna | Made with care | Not a medical device</Text>
      </Page>

      <Page size="LETTER" style={styles.page}>
        <Text style={styles.sectionTitle}>Top symptoms</Text>
        {data.top_symptoms.length === 0 ? (
          <Text style={styles.paragraph}>No symptoms recorded.</Text>
        ) : (
          data.top_symptoms.map((symptom) => (
            <View key={symptom.name} style={styles.listItem}>
              <Text style={styles.bullet}>*</Text>
              <Text>
                {symptom.name} - noted {symptom.count} time{symptom.count === 1 ? '' : 's'}
              </Text>
            </View>
          ))
        )}

        <Text style={styles.sectionTitle}>Likely triggers</Text>
        <ListItems items={data.top_triggers} empty="No clear triggers detected yet. Keep whispering." />

        <Text style={styles.sectionTitle}>What seemed to help</Text>
        <ListItems items={data.what_worked} empty="Too early to tell. Your patterns are still forming." />
        <Text style={styles.footer}>Luna | Made with care | Not a medical device</Text>
      </Page>

      <Page size="LETTER" style={styles.page}>
        <Text style={styles.sectionTitle}>For your clinician</Text>
        <Text style={styles.paragraph}>Bring these questions to your next appointment.</Text>
        <ListItems
          items={data.doctor_questions}
          empty="Ask which patterns would be useful to track before your next visit."
        />

        {data.haiku && (
          <View style={styles.haikuBox}>
            <Text style={styles.sectionEyebrow}>A haiku from your month</Text>
            {data.haiku.map((line) => (
              <Text key={line} style={styles.haikuLine}>
                {line}
              </Text>
            ))}
            <Text style={[styles.paragraph, { textAlign: 'right', marginTop: 14 }]}>- Luna</Text>
          </View>
        )}

        <Text style={styles.footer}>Luna | Made with care | Not a medical device</Text>
      </Page>
    </Document>
  );
}
