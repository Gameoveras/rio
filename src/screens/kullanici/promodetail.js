import React from 'react';
import { StyleSheet, Text, View, Image, ScrollView, Dimensions, TouchableOpacity, Animated } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

const { width, height } = Dimensions.get('window');

export default function PromoDetail({ route }) {
  const { item } = route.params;
  const navigation = useNavigation();
  const scrollY = new Animated.Value(0);

  const imageScale = scrollY.interpolate({
    inputRange: [-100, 0, 100],
    outputRange: [1.5, 1, 1],
    extrapolate: 'clamp',
  });

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{item.baslik}</Text>
      </View>

      {/* ScrollView */}
      <ScrollView
        scrollEventThrottle={16}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: false }
        )}
      >
        {/* Hero Image with Parallax Effect */}
        <Animated.View style={[styles.imageContainer, { transform: [{ scale: imageScale }] }]}>
          <Image
            source={{ uri: `https://asebay.com.tr/moods/yonetici/uploads/${item.on_resmi}` }}
            style={styles.promoImage}
            resizeMode="cover"
          />
          <LinearGradient
            colors={['transparent', 'rgba(0,0,0,0.8)']}
            style={styles.gradientOverlay}
          />
        </Animated.View>

        {/* Content */}
        <View style={styles.contentContainer}>
          <Text style={styles.titleText}>{item.baslik}</Text>
          <View style={styles.descriptionContainer}>
            <Text style={styles.subtitleText}>{item.on_aciklama}</Text>
            <Text style={styles.bodyText}>{item.icerik}</Text>
          </View>

          {/* Badge with Animation */}
          <TouchableOpacity style={styles.badgeContainer}>
            <Text style={styles.badgeText}>{item.tur.toUpperCase()}</Text>
          </TouchableOpacity>

         
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5DC', // Bej arka plan
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#6F4E37', // Kahverengi header
    paddingVertical: 16,
    paddingHorizontal: 16,
    zIndex: 10, // Header'ı en üstte tutar
    marginTop: 55,
  },
  backButton: {
    marginRight: 16,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF', // Beyaz metin
  },
  imageContainer: {
    width: width,
    height: height * 0.4,
    overflow: 'hidden',
  },
  promoImage: {
    width: '100%',
    height: '100%',
  },
  gradientOverlay: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: '50%',
    backgroundColor: 'rgba(111, 78, 55, 0.5)', // Kahverengi gradient
  },
  contentContainer: {
    padding: 16,
    marginTop: -20,
    backgroundColor: '#F5F5DC', // Bej arka plan
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  titleText: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#3E2723', // Koyu kahverengi başlık
    marginBottom: 12,
  },
  subtitleText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#5D4037', // Orta kahverengi alt başlık
    marginBottom: 8,
  },
  bodyText: {
    fontSize: 16,
    color: '#4E342E', // Koyu gri-kahverengi metin
    lineHeight: 24,
  },
  descriptionContainer: {
    marginBottom: 24,
  },
  badgeContainer: {
    backgroundColor: '#C4A484', // Açık kahverengi badge
    alignSelf: 'flex-start',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginBottom: 24,
  },
  badgeText: {
    color: '#3E2723', // Koyu kahverengi metin
    fontSize: 14,
    fontWeight: '600',
  },
  actionButton: {
    backgroundColor: '#6F4E37', // Kahverengi buton
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  actionButtonText: {
    color: '#FFFFFF', // Beyaz metin
    fontSize: 18,
    fontWeight: 'bold',
  },
});