import {
  StyleSheet,
  Text,
  View,
  Dimensions,
  SafeAreaView,
  Platform,
  TouchableOpacity,
  Animated,
  Easing,
  Alert,
  ScrollView
} from 'react-native';
import React, { useEffect, useRef, useState, useCallback } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import QRCode from 'react-native-qrcode-svg';
import { MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import AsyncStorage from '@react-native-async-storage/async-storage';
import AppService from '../../api/api';
import Svg, { Circle, G } from 'react-native-svg';

export default function QRCustomer({ navigation }) {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.95)).current;
  const windowWidth = Dimensions.get('window').width;

  // Kullanıcı bilgileri
  const [userData, setUserData] = useState({
    ad_soyad: '',
    yildiz_sayisi: 0,
  });
  // Kullanıcı id'si (AsyncStorage'dan okunuyor)
  const [userid, setUserId] = useState(null);

  const [freeCoffees, setFreeCoffees] = useState(0);
  const progressAnim = useRef(new Animated.Value(0)).current;
  const scaleValue = useRef(new Animated.Value(0)).current;

  // Kahve sayısını (yıldız sayısı) ve kalan kahve bilgisini hesaplama
  const coffeeCount = userData.yildiz_sayisi;
  const remaining = 10 - (coffeeCount % 10);
  const progress = (coffeeCount % 10) / 10;

  // AsyncStorage'dan kullanıcı bilgisini çekme
  useEffect(() => {
    const fetchUserDataFromStorage = async () => {
      try {
        const storedUserData = await AsyncStorage.getItem('userData');
        if (storedUserData) {
          const parsedData = JSON.parse(storedUserData);
          setUserId(parsedData.userId);
        }
      } catch (error) {
        console.error('Kullanıcı verisi alınamadı:', error);
      }
    };

    fetchUserDataFromStorage();

    // Sayfa açılışında animasyonları başlat
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 8,
        tension: 40,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  // Kullanıcı verilerini çekme fonksiyonu
  const fetchUserDataFromServer = async () => {
    if (userid) {
      try {
        const response = await AppService.getUser(userid);
        if (response?.data?.user) {
          setUserData(response.data.user);
        } else if (response.user) {
          setUserData(response.user);
        } else {
          throw new Error("Geçersiz API yanıtı");
        }
      } catch (error) {
        console.error('Hata:', error);
        Alert.alert('Hata', 'Veriler alınamadı');
      }
    }
  };

  // userId mevcutsa sunucudan kullanıcı verilerini çekme (ilk açılışta)
  useEffect(() => {
    if (userid) {
      fetchUserDataFromServer();
    }
  }, [userid]);

  // Ekran focus olduğunda verileri yenile
  useFocusEffect(
    useCallback(() => {
      fetchUserDataFromServer();
    }, [userid])
  );

  // **Değişiklik: Her 30 saniyede bir verileri otomatik olarak güncelle**
  useEffect(() => {
    const interval = setInterval(() => {
      fetchUserDataFromServer();
    }, 20000); // 30 saniye (önceki 60000 yerine)
    return () => clearInterval(interval); // Bellek sızıntısını önlemek için temizleme
  }, [userid]);

  // Ücretsiz kahve kontrolü
  useEffect(() => {
    const earned = Math.floor(coffeeCount / 10);
    if (earned > freeCoffees) {
      setFreeCoffees(earned);
      triggerCelebration();
    }
  }, [coffeeCount]);

  const triggerCelebration = () => {
    Animated.sequence([
      Animated.timing(scaleValue, {
        toValue: 1,
        duration: 500,
        easing: Easing.elastic(2),
        useNativeDriver: true,
      }),
      Animated.timing(scaleValue, {
        toValue: 0,
        delay: 1500,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();
  };

  // Animasyonlu progress bar güncellemesi
  useEffect(() => {
    Animated.timing(progressAnim, {
      toValue: progress,
      duration: 1000,
      easing: Easing.bezier(0.4, 0, 0.2, 1),
      useNativeDriver: true,
    }).start();
  }, [progress]);

  const AnimatedCircle = Animated.createAnimatedComponent(Circle);

  // QR kod verisini oluşturma
  const qrData = JSON.stringify({
    user_id: userid,
    ad_soyad: userData.ad_soyad,
    yildiz_sayisi: userData.yildiz_sayisi,
    timestamp: new Date().toISOString(),
  });

  // Kullanıcının verilerini manuel yenileme (opsiyonel)
  const refreshUserData = async () => {
    await fetchUserDataFromServer();
    Alert.alert("Başarılı", "Veriler güncellendi.");
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView style={styles.scrollView}>
        <View style={styles.container}>
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity 
              style={styles.backButton} 
              onPress={() => navigation.goBack()}
            >
              <Ionicons name="chevron-back" size={24} color="#333" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Kahve Puanlarım</Text>
            <View style={styles.backButton} />
          </View>

          {/* Welcome Card */}
          <LinearGradient 
            colors={['#8B6B4E', '#6F4E37']} 
            style={styles.welcomeCard}
          >
            <Text style={styles.welcomeText}>Hoş geldin, {userData.ad_soyad}</Text>
            <Text style={styles.yildizText}>⭐ {userData.yildiz_sayisi} Yıldız</Text>
          </LinearGradient>

          {/* QR Code Section */}
          <Animated.View 
            style={[
              styles.qrSection, 
              { 
                opacity: fadeAnim, 
                transform: [{ scale: scaleAnim }] 
              }
            ]}
          >
            <View style={styles.qrContainer}>
              <QRCode
                value={qrData}
                size={windowWidth * 0.6}
                backgroundColor="white"
                color="#1A1A1A"
              />
              <View style={styles.qrInfo}>
                <MaterialCommunityIcons 
                  name="qrcode-scan" 
                  size={18} 
                  color="#666" 
                />
                <Text style={styles.scanMessage}>Kasiyere gösteriniz</Text>
              </View>
            </View>
          </Animated.View>

          {/* Progress Circle */}
          <View style={styles.progressContainer}>
            <View style={styles.progressCard}>
              <Svg width="200" height="200">
                <G rotation="-90" origin="100, 100">
                  <Circle
                    cx="100"
                    cy="100"
                    r="85"
                    stroke="#E8D5C4"
                    strokeWidth="15"
                    fill="transparent"
                  />
                  <AnimatedCircle
                    cx="100"
                    cy="100"
                    r="85"
                    stroke="#8B6B4E"
                    strokeWidth="15"
                    fill="transparent"
                    strokeLinecap="round"
                    strokeDasharray={`${2 * Math.PI * 85}`}
                    strokeDashoffset={progressAnim}
                  />
                </G>
              </Svg>
              <View style={styles.progressTextContainer}>
                <Text style={styles.progressNumber}>{coffeeCount}</Text>
                <Text style={styles.progressLabel}>Kahve</Text>
                <Text style={styles.remainingText}>
                  {remaining} Kahve Kaldı
                </Text>
              </View>
            </View>
          </View>

          {/* Free Coffee Badge */}
          <LinearGradient
            colors={['#8B6B4E', '#6F4E37']}
            style={styles.freeCoffeeBadge}
          >
            <Text style={styles.freeCoffeeText}>
              ⭐ {freeCoffees} Bedava Kahve
            </Text>
          </LinearGradient>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
  },
  welcomeCard: {
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    alignItems: 'center',
  },
  welcomeText: {
    color: 'white',
    fontSize: 22,
    fontWeight: '600',
    marginBottom: 8,
  },
  yildizText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '500',
  },
  qrSection: {
    alignItems: 'center',
    marginBottom: 24,
  },
  qrContainer: {
    padding: 24,
    borderRadius: 16,
    backgroundColor: 'white',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  qrInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 16,
  },
  scanMessage: {
    marginLeft: 8,
    fontSize: 14,
    color: '#666',
  },
  scrollView: {
    flex: 1,
  },
  progressContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  progressCard: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  progressTextContainer: {
    position: 'absolute',
    alignItems: 'center',
  },
  progressNumber: {
    fontSize: 48,
    fontWeight: '700',
    color: '#6F4E37',
  },
  progressLabel: {
    fontSize: 16,
    color: '#8B6B4E',
    fontWeight: '500',
    marginTop: -4,
  },
  remainingText: {
    marginTop: 8,
    fontSize: 14,
    color: '#A1887F',
    fontWeight: '500',
  },
  freeCoffeeBadge: {
    alignSelf: 'center',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 24,
  },
  freeCoffeeText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});