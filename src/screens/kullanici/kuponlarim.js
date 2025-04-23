import { StyleSheet, Text, View, FlatList, TouchableOpacity, StatusBar, ImageBackground } from 'react-native';
import React, { useEffect, useState } from 'react';
import AppService from '../../api/api';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { Shadow } from 'react-native-shadow-2';
import Toast from 'react-native-toast-message';
import { LinearGradient } from 'expo-linear-gradient';

export default function Kuponlarim({ navigation }) {
  const [userData, setUserData] = useState(null);
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const storedUserData = await AsyncStorage.getItem('userData');
        if (storedUserData) {
          const parsedData = JSON.parse(storedUserData);
          setUserData(parsedData);
          fetchCoupons(parsedData.userId);
        }
      } catch (error) {
        console.error('Veri alınamadı:', error);
        setError('Kullanıcı verileri yüklenemedi');
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const fetchCoupons = async (userId) => {
    try {
      const response = await AppService.getCoupons(userId);
      if (response.success) {
        setCoupons(response.coupons);
      } else {
        setError(response.error || 'Kuponlar yüklenemedi');
      }
    } catch (error) {
      setError(error.error || 'Beklenmeyen bir hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  const handleUseCoupon = async (couponId) => {
    try {
      const response = await AppService.useCoupon(userData.userId, couponId);
      if (response.success) {
        Toast.show({
          type: 'success',
          text1: 'Başarılı!',
          text2: response.message || 'Kupon başarıyla kullanıldı',
        });
        fetchCoupons(userData.userId);
      } else {
        Toast.show({
          type: 'error',
          text1: 'Hata!',
          text2: response.error || 'Kupon kullanılamadı',
        });
      }
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: 'Hata!',
        text2: error.error || 'İşlem sırasında hata oluştu',
      });
    }
  };

  const Header = () => (
    <LinearGradient
      colors={['#2C1810', '#3E2216']}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.header}
    >
      <View style={styles.headerTop}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Icon name="chevron-left" size={28} color="#FFF" />
        </TouchableOpacity>

        <View style={styles.headerContent}>
          <View style={styles.coffeeIcon}>
            <Icon name="local-cafe" size={28} color="#E3B577" />
          </View>
          <Text style={styles.headerTitle}>Kahve Kuponlarım</Text>
        </View>
      </View>

      <View style={styles.headerDivider} />
    </LinearGradient>
  );

  const renderCouponItem = ({ item }) => (
    <Shadow distance={6} offset={[0, 3]} startColor="#00000010" style={styles.shadow}>
      <View style={[styles.couponContainer, item.kullanildi_mi === '1' && styles.usedCoupon]}>
        <View style={styles.couponHeader}>
          <View style={styles.couponIcon}>
            <Icon name="local-cafe" size={28} color={item.kullanildi_mi === '0' ? '#C67C4E' : '#AAA'} />
          </View>
          <View>
            <Text style={styles.couponValue}>{item.kazanilan_yildiz} Yıldız</Text>
            <Text style={styles.couponType}>Premium Kahve Kuponu</Text>
          </View>
        </View>

        <View style={styles.progressBar}>
          <LinearGradient
            colors={['#C67C4E', '#E3B577']}
            style={[styles.progressFill, { width: '70%' }]}
          />
        </View>

        <View style={styles.couponFooter}>
          <View>
            <Text style={styles.codeLabel}>KUPON KODU</Text>
            <Text style={styles.couponCode}>{item.kupon_kodu}</Text>
          </View>

          {item.kullanildi_mi === '0' ? (
            <TouchableOpacity style={styles.useButton} onPress={() => handleUseCoupon(item.id)}>
              <Text style={styles.useButtonText}>Kullan</Text>
            </TouchableOpacity>
          ) : (
            <View style={styles.usedWrapper}>
              <Icon name="check-circle" size={20} color="#8D8D8D" />
              <Text style={styles.usedText}>Kullanıldı</Text>
            </View>
          )}
        </View>
      </View>
    </Shadow>
  );

  return (
    <ImageBackground
      source={require('../../../assets/images/arkaplanlar/unuttum.png')}
      style={styles.backgroundImage}
      resizeMode="cover"
    >
      <View style={styles.container}>
        <StatusBar barStyle="light-content" />
        <Header />

        {coupons.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyTitle}>Henüz Kuponunuz Yok</Text>
            <Text style={styles.emptyText}>
              Kahve alışverişlerinizle puan kazanın ve{'\n'}
              özel kuponların kilidini açın
            </Text>
           
          </View>
        ) : (
          <FlatList
            data={coupons}
            renderItem={renderCouponItem}
            keyExtractor={(item) => item.id.toString()}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
          />
        )}

        <Toast />
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  backgroundImage: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  container: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.8)', // Arka plana hafif bir beyaz overlay
  },
  header: {
    paddingTop: 44,
    paddingHorizontal: 24,
    paddingBottom: 16,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    overflow: 'hidden',
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backButton: {
    padding: 8,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    right: 112,
  },
  coffeeIcon: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '600',
    color: '#FFF',
  },
  headerDivider: {
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.1)',
    marginTop: 16,
  },
  couponContainer: {
    marginHorizontal: 24,
    marginBottom: 16,
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: '#EEE',
  },
  usedCoupon: {
    opacity: 0.6,
  },
  shadow: {
    width: '100%',
  },
  couponHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    marginBottom: 20,
  },
  couponIcon: {
    backgroundColor: '#F8F6F4',
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  couponValue: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2F2D2C',
  },
  couponType: {
    fontSize: 12,
    color: '#9B9B9B',
    marginTop: 4,
  },
  progressBar: {
    height: 4,
    backgroundColor: '#EEE',
    borderRadius: 2,
    marginBottom: 16,
  },
  progressFill: {
    height: '100%',
    borderRadius: 2,
  },
  couponFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  codeLabel: {
    fontSize: 10,
    color: '#9B9B9B',
    marginBottom: 4,
  },
  couponCode: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2F2D2C',
  },
  useButton: {
    backgroundColor: '#C67C4E',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  useButtonText: {
    color: '#FFF',
    fontWeight: '600',
    fontSize: 14,
  },
  usedWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    padding: 10,
  },
  usedText: {
    color: '#8D8D8D',
    fontSize: 14,
    fontWeight: '500',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#2F2D2C',
    textAlign: 'center',
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: '#2F2D2C',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 24,
  },
  earnButton: {
    backgroundColor: '#C67C4E',
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 12,
  },
  earnButtonText: {
    color: '#FFF',
    fontWeight: '600',
    fontSize: 14,
  },
  listContent: {
    paddingTop: 16,
    paddingBottom: 24,
  },
});