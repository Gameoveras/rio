import { StyleSheet, Text, View, ScrollView, TouchableOpacity, TextInput, Image, Modal, Platform, Alert } from 'react-native';
import React, { useState, useEffect } from 'react';
import { AntDesign, MaterialIcons, Ionicons } from '@expo/vector-icons';
import AppService from '../../api/api';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function Tercihlerim({ navigation }) {
  const [favorites, setFavorites] = useState([]);
  const [filterType, setFilterType] = useState('Tümü');
  const [sortBy, setSortBy] = useState('rating');
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [userData, setUserData] = useState({});

  // Kullanıcı verisini çek
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const storedUserData = await AsyncStorage.getItem('userData');
        if (storedUserData) {
          const parsedData = JSON.parse(storedUserData);
          setUserData(parsedData);
        }
      } catch (error) {
        console.error('Kullanıcı verisi alınamadı:', error);
      }
    };
    fetchUserData();
  }, []);

  // Favorileri çek
  useEffect(() => {
    const fetchFavorites = async () => {
      if (!userData.userId) {
        return;
      }

      try {
        const response = await AppService.getFavorites(userData.userId);

        if (response.success) {
          setFavorites(response.favorites); // API'den gelen favorileri ayarla
        } else {
          console.error('Favori getirme işlemi başarısız:', response.error);
        }
      } catch (error) {
        console.error('API Hatası:', error);
      }
    };

    fetchFavorites();
  }, [userData.userId]); // userData.userId değiştiğinde favorileri yeniden çek

  // Favori kaldırma işlemi
  const removeFavorite = async (menu_id) => {
    try {
      // Sunucudan favoriyi kaldır
      const response = await AppService.removeFavorite(userData.userId, menu_id);
  
      if (response.success) {
        // Yerel durumu güncelle
        const newFavorites = favorites.filter((item) => item.menu_id !== menu_id);
        setFavorites(newFavorites);
        
        // AsyncStorage güncellenmesini bekle
        await AsyncStorage.setItem('favorites', JSON.stringify(newFavorites));
      } else {
        Alert.alert('Hata', 'Favori kaldırılırken bir hata oluştu.');
      }
    } catch (error) {
      console.error('Favori kaldırma hatası:', error);
      Alert.alert('Hata', 'Favori kaldırılırken bir hata oluştu.');
    }
  };
  

  // Filtrelenmiş ve sıralanmış favoriler
  const filteredFavorites = favorites
    .filter((item) => (filterType === 'Tümü' ? true : item.kategori === filterType))
    .sort((a, b) => {
      switch (sortBy) {
        case 'rating':
          return b.rating - a.rating;
        case 'price':
          return parseInt(b.fiyat) - parseInt(a.fiyat);
        case 'name':
          return a.ad.localeCompare(b.ad);
        default:
          return 0;
      }
    });

  // Yıldızları render etme
  const renderStars = (rating) => (
    <View style={styles.starsContainer}>
      {[1, 2, 3, 4, 5].map((star) => (
        <AntDesign
          key={star}
          name={star <= rating ? 'star' : 'staro'}
          size={20}
          color={star <= rating ? '#FFD700' : '#BDC3C7'}
        />
      ))}
    </View>
  );

  // Filtre modalı
  const FilterModal = () => (
    <Modal
      animationType="slide"
      transparent={true}
      visible={showFilterModal}
      onRequestClose={() => setShowFilterModal(false)}
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <Text style={styles.modalHeader}>Filtrele ve Sırala</Text>

          <Text style={styles.modalSubHeader}>Kategori</Text>
          {['Tümü', 'Yiyecek', 'İçecek', 'Tatlılar', 'Atıştırmalıklar'].map((type) => (
            <TouchableOpacity
              key={type}
              style={[styles.filterButton, filterType === type && styles.filterButtonActive]}
              onPress={() => setFilterType(type)}
            >
              <Text style={[styles.filterButtonText, filterType === type && styles.filterButtonTextActive]}>
                {type}
              </Text>
            </TouchableOpacity>
          ))}

          <Text style={styles.modalSubHeader}>Sıralama</Text>
          {['rating', 'price', 'name'].map((key) => (
            <TouchableOpacity
              key={key}
              style={[styles.filterButton, sortBy === key && styles.filterButtonActive]}
              onPress={() => setSortBy(key)}
            >
              <Text style={[styles.filterButtonText, sortBy === key && styles.filterButtonTextActive]}>
                {{
                  rating: 'Puana Göre',
                  price: 'Fiyata Göre',
                  name: 'İsme Göre',
                }[key]}
              </Text>
            </TouchableOpacity>
          ))}

          <TouchableOpacity
            style={styles.closeModalButton}
            onPress={() => setShowFilterModal(false)}
          >
            <Text style={styles.closeModalButtonText}>Kapat</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Favorilerim</Text>
        <TouchableOpacity onPress={() => setShowFilterModal(true)}>
          <MaterialIcons name="filter-list" size={24} color="white" />
        </TouchableOpacity>
      </View>

      <ScrollView>
        {filteredFavorites.map((item) => (
          <View key={item.menu_id} style={styles.itemCard}>
            <TouchableOpacity
              style={styles.removeButton}
              onPress={() => removeFavorite(item.menu_id)} // menu_id gönderiliyor
            >
              <Ionicons name="close-circle" size={24} color="#E74C3C" />
            </TouchableOpacity>

            <Image
              source={{ uri: `https://Asebay.com.tr/moods/yonetici/${item.resim}` }}
              style={styles.itemImage}
              resizeMode="cover"
            />

            <View style={styles.itemHeader}>
              <View>
                <Text style={styles.itemType}>{item.kategori}</Text>
                <Text style={styles.itemName}>{item.menu_adi}</Text>
                <Text style={styles.itemPrice}>₺{item.fiyat}</Text>
              </View>
              {renderStars(item.rating)}
            </View>

            <TouchableOpacity
              style={styles.detailButton}
              onPress={() => navigation.navigate('CoffeeDetail', { item })}
            >
              <Text style={styles.detailButtonText}>
                İçindekileri Görüntüle
              </Text>
              <Ionicons name="chevron-forward" size={20} color="#6F4E37" />
            </TouchableOpacity>
          </View>
        ))}
      </ScrollView>

      <FilterModal />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF5E6', // Açık bej arka plan
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: Platform.OS === 'ios' ? 50 : 40,
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: '#6F4E37', // Kahve rengi header
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    shadowColor: '#2C1810',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
  },
  headerTitle: {
    color: '#FFF5E6',
    fontSize: 20,
    fontWeight: '600',
    fontFamily: 'PlayfairDisplay_600SemiBold',
  },
  itemCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    margin: 16,
    elevation: 3,
    shadowColor: '#2C1810',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#EEE0D3',
  },
  itemImage: {
    width: '100%',
    height: 220,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  removeButton: {
    position: 'absolute',
    right: 12,
    top: 12,
    zIndex: 1,
    backgroundColor: 'rgba(110, 78, 55, 0.9)',
    borderRadius: 20,
    padding: 4,
  },
  itemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    padding: 16,
    backgroundColor: '#FFFCF8',
  },
  itemType: {
    fontSize: 14,
    color: '#8A9A5B', // Zeytin yeşili
    marginBottom: 4,
    fontWeight: '500',
    textTransform: 'uppercase',
  },
  itemName: {
    fontSize: 22,
    fontWeight: '600',
    color: '#3E2723', // Koyu kahve
    marginBottom: 4,
    fontFamily: 'PlayfairDisplay_700Bold',
  },
  itemPrice: {
    fontSize: 18,
    color: '#6F4E37',
    fontWeight: '600',
  },
  starsContainer: {
    flexDirection: 'row',
    gap: 3,
    alignItems: 'center',
  },
  reviewSection: {
    padding: 16,
    backgroundColor: '#FFFCF8',
  },
  reviewHeader: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
    color: '#3E2723',
    fontFamily: 'PlayfairDisplay_600SemiBold',
  },
  review: {
    backgroundColor: 'rgba(138, 154, 91, 0.1)', // Yeşil tonu opak
    padding: 14,
    borderRadius: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#EEE0D3',
  },
  reviewText: {
    marginTop: 8,
    color: '#5A4A42',
    fontSize: 15,
    lineHeight: 22,
  },
  reviewDate: {
    fontSize: 13,
    color: '#8A7467',
    marginTop: 6,
    fontStyle: 'italic',
  },
  addReview: {
    marginTop: 20,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#EEE0D3',
  },
  addReviewHeader: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
    color: '#3E2723',
  },
  reviewInput: {
    backgroundColor: '#FFFCF8',
    borderRadius: 12,
    padding: 14,
    height: 100,
    marginTop: 8,
    marginBottom: 15,
    textAlignVertical: 'top',
    fontSize: 16,
    color: '#5A4A42',
    borderWidth: 1,
    borderColor: '#D4BFAF',
  },
  submitButton: {
    backgroundColor: '#8A9A5B', // Zeytin yeşili
    padding: 14,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#2C1810',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  submitButtonText: {
    color: '#FFFCF8',
    fontWeight: '600',
    fontSize: 16,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(46, 34, 22, 0.6)',
  },
  modalContent: {
    backgroundColor: '#FFFCF8',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    padding: 24,
    minHeight: '50%',
  },
  modalHeader: {
    fontSize: 24,
    fontWeight: '600',
    marginBottom: 20,
    color: '#3E2723',
    fontFamily: 'PlayfairDisplay_700Bold',
  },
  modalSubHeader: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 16,
    marginBottom: 12,
    color: '#6F4E37',
  },
  filterButton: {
    padding: 14,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#D4BFAF',
    marginBottom: 10,
    backgroundColor: '#FFFFFF',
  },
  filterButtonActive: {
    backgroundColor: '#8A9A5B',
    borderColor: '#8A9A5B',
  },
  filterButtonText: {
    color: '#5A4A42',
    textAlign: 'center',
    fontSize: 16,
    fontWeight: '500',
  },
  filterButtonTextActive: {
    color: '#FFFCF8',
  },
  closeModalButton: {
    backgroundColor: '#6F4E37',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 24,
    elevation: 3,
  },
  closeModalButtonText: {
    color: '#FFFCF8',
    fontWeight: '600',
    fontSize: 16,
  },
  detailButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#EEE0D3',
    margin: 16,
    borderRadius: 12
  },
  detailButtonText: {
    color: '#6F4E37',
    fontSize: 16,
    fontWeight: '500'
  },

})