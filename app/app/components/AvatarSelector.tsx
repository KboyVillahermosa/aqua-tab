import React, { useEffect, useMemo, useState } from 'react';
import { View, Text, Image, TouchableOpacity, FlatList, StyleSheet, Alert } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Pre-made avatars bundled with the app.
// Using existing images under app/assets/images to avoid missing-file errors.
const PRESET_AVATARS = [
  { id: 'avatar1', source: require('../../assets/images/icon.png') },
  { id: 'avatar2', source: require('../../assets/images/mainlogo.png') },
  { id: 'avatar3', source: require('../../assets/images/react-logo.png') },
];

const STORAGE_KEY = 'selected_avatar_v1';

type SelectedAvatar =
  | { type: 'preset'; id: string }
  | { type: 'custom'; uri: string };

type AvatarSelectorProps = {
  onChange?: (selected: SelectedAvatar) => void;
};

// AvatarSelector: lets users pick a bundled avatar or upload a custom one and persists selection.
export default function AvatarSelector({ onChange }: AvatarSelectorProps) {
  const [selected, setSelected] = useState<SelectedAvatar | null>(null);
  const [loading, setLoading] = useState(true);

  // Resolve the Image source for the current selection.
  const selectedSource = useMemo(() => {
    if (selected?.type === 'custom' && selected.uri) {
      return { uri: selected.uri };
    }
    if (selected?.type === 'preset') {
      const match = PRESET_AVATARS.find((a) => a.id === selected.id);
      if (match) return match.source;
    }
    return PRESET_AVATARS[0]?.source;
  }, [selected]);

  // Load persisted selection on mount.
  useEffect(() => {
    (async () => {
      try {
        const raw = await AsyncStorage.getItem(STORAGE_KEY);
        if (raw) {
          const parsed = JSON.parse(raw) as SelectedAvatar;
          setSelected(parsed);
          onChange?.(parsed);
        } else {
          setSelected({ type: 'preset', id: PRESET_AVATARS[0].id });
        }
      } catch (err) {
        console.warn('AvatarSelector: failed to load saved avatar', err);
      } finally {
        setLoading(false);
      }
    })();
  }, [onChange]);

  // Persist selection and notify parent.
  const persistSelection = async (next: SelectedAvatar) => {
    setSelected(next);
    onChange?.(next);
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch (err) {
      console.warn('AvatarSelector: failed to save avatar', err);
    }
  };

  // Handle picking a preset avatar.
  const handleSelectPreset = (id: string) => {
    persistSelection({ type: 'preset', id });
  };

  // Handle custom image upload via Image Picker.
  const handleUploadCustom = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission needed', 'Please allow photo access to upload a custom avatar.');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        quality: 0.8,
        allowsEditing: true,
        aspect: [1, 1],
      });

      if (result.canceled) return;

      const uri = result.assets?.[0]?.uri;
      if (!uri) return;

      persistSelection({ type: 'custom', uri });
    } catch (err) {
      console.warn('AvatarSelector: upload error', err);
      Alert.alert('Upload failed', 'Could not select an image. Please try again.');
    }
  };

  const renderAvatar = ({ item }: { item: (typeof PRESET_AVATARS)[number] }) => {
    const isSelected = selected?.type === 'preset' && selected.id === item.id;
    return (
      <TouchableOpacity onPress={() => handleSelectPreset(item.id)} style={styles.avatarWrapper}>
        <Image source={item.source} style={[styles.avatar, isSelected && styles.avatarSelected]} />
      </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <Text style={styles.heading}>Choose an avatar</Text>
        <Text style={styles.subtle}>Loading...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Preset avatar list */}
      <Text style={styles.heading}>Choose an avatar</Text>
      <FlatList
        data={PRESET_AVATARS}
        horizontal
        keyExtractor={(item) => item.id}
        renderItem={renderAvatar}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
      />

      {/* Upload custom image */}
      <TouchableOpacity style={styles.uploadButton} onPress={handleUploadCustom}>
        <Text style={styles.uploadButtonText}>Upload Custom Image</Text>
      </TouchableOpacity>

      {/* Selected avatar preview */}
      <Text style={styles.previewLabel}>Current selection</Text>
      <View style={styles.previewWrapper}>
        <Image source={selectedSource as any} style={styles.previewImage} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
  heading: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 12,
  },
  subtle: {
    fontSize: 14,
    color: '#6B7280',
  },
  listContent: {
    paddingVertical: 8,
  },
  avatarWrapper: {
    marginRight: 12,
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  avatarSelected: {
    borderColor: '#2563EB',
  },
  uploadButton: {
    marginTop: 12,
    backgroundColor: '#2563EB',
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  uploadButtonText: {
    color: 'white',
    fontWeight: '700',
    fontSize: 16,
  },
  previewLabel: {
    marginTop: 20,
    marginBottom: 8,
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
  },
  previewWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  previewImage: {
    width: 140,
    height: 140,
    borderRadius: 70,
    borderWidth: 3,
    borderColor: '#2563EB',
    backgroundColor: '#E5E7EB',
  },
});
