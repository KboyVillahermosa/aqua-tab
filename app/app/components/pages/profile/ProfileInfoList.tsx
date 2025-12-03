import React from 'react';
import { View, Text } from 'react-native';

interface Row {
  label: string;
  value?: string | number | null;
}

interface Section {
  title?: string;
  rows: Row[];
}

export default function ProfileInfoList({ sections }: { sections: Section[] }) {
  return (
    <>
      {sections.map((section, si) => (
        <View key={si} style={{ marginBottom: 24 }}>
          {section.title ? (
            <Text style={{
              fontSize: 18,
              fontWeight: '700',
              color: '#1F2937',
              marginBottom: 12,
            }}>{section.title}</Text>
          ) : null}

          <View style={{ backgroundColor: 'white', borderRadius: 16, padding: 20 }}>
            {section.rows.map((r, idx) => (
              <View key={idx}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 12 }}>
                  <Text style={{ fontSize: 14, color: '#6B7280', fontWeight: '500' }}>{r.label}</Text>
                  <Text style={{ fontSize: 14, color: '#1F2937', fontWeight: '600', textAlign: 'right' }}>{r.value ?? 'Not set'}</Text>
                </View>
                {idx < section.rows.length - 1 ? <View style={{ height: 1, backgroundColor: '#E5E7EB', marginVertical: 4 }} /> : null}
              </View>
            ))}
          </View>
        </View>
      ))}
    </>
  );
}
