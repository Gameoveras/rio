import { StyleSheet, Text, View, TouchableOpacity, ScrollView, SafeAreaView, StatusBar, ImageBackground } from 'react-native';
import React from 'react';
import AppService from '../../api/api';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect } from 'react';
import { Ionicons } from '@expo/vector-icons';

export default function SiparisGecmisi({ navigation }) {
  const [userData, setUserData] = React.useState(null);
  const [hesapBilgileri, setHesapBilgileri] = React.useState(null);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const storedUserData = await AsyncStorage.getItem('userData');
        if (storedUserData) {
          setUserData(JSON.parse(storedUserData));
        }
      } catch (error) {
        console.error('Kullanıcı verisi alınamadı:', error);
      }
    };
    fetchUserData();
  }, []);

  useEffect(() => {
    const fetchHesapBilgileri = async () => {
      if (userData) {
        AppService.getAccountMovements(userData.userId)
          .then((response) => {
            setHesapBilgileri(response.movements);
          })
          .catch((error) => {
            console.error('Siparişler alınamadı:', error);
          });
      }
    }
    fetchHesapBilgileri();
  }, [userData]);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('tr-TR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getIslemRengi = (islemTipi) => {
    return islemTipi === 'ekle' ? '#4CAF50' : '#FF5252';
  };

  return (
    <ImageBackground source={require('../../../assets/images/arkaplanlar/anasayfa.png')} style={styles.backgroundImage}>
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="light-content" />
        
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity 
            onPress={() => navigation.goBack()} 
            style={styles.backButton}
          >
            <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Sipariş Geçmişi</Text>
          <View style={styles.coffeeIcon}>
            <Ionicons name="cafe" size={24} color="#FFFFFF" />
          </View>
        </View>

        {/* Content */}
        <ScrollView style={styles.content}>
          {hesapBilgileri?.map((hareket, index) => (
            <View key={hareket.id} style={styles.siparisCard}>
              <View style={styles.siparisHeader}>
                <View style={[styles.islemTipiBadge, { backgroundColor: getIslemRengi(hareket.islem_tipi) }]}>
                  <Text style={styles.islemTipiText}>
                    {hareket.islem_tipi === 'ekle' ? 'Yeni Sipariş' : 'İptal'}
                  </Text>
                </View>
                <Text style={styles.tarih}>{formatDate(hareket.islem_tarihi)}</Text>
              </View>
              
              <View style={styles.siparisDetails}>
                <View style={styles.detailRow}>
                  <Ionicons name="receipt-outline" size={20} color="#8D6E63" />
                  <Text style={styles.siparisId}>Sipariş #{hareket.id}</Text>
                </View>
              </View>
            </View>
          ))}
        </ScrollView>
      </SafeAreaView>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  backgroundImage: {
    flex: 1,
    resizeMode: 'cover',
  },
  container: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: 'rgba(93, 64, 55, 0.8)',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
    elevation: 2,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    flex: 1,
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textAlign: 'center',
    marginRight: 40,
  },
  coffeeIcon: {
    position: 'absolute',
    right: 16,
    padding: 8,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  siparisCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  siparisHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  islemTipiBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  islemTipiText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  tarih: {
    color: '#757575',
    fontSize: 14,
  },
  siparisDetails: {
    marginTop: 8,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  siparisId: {
    marginLeft: 8,
    fontSize: 16,
    color: '#5D4037',
    fontWeight: '500',
  },
});