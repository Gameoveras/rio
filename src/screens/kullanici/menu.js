import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TextInput,
  TouchableOpacity,
  StatusBar,
  Dimensions,
  ActivityIndicator,
  Platform,
  Alert,
  Modal
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import MenuItem from './MenuItem';
import AppService from '../../api/api';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width } = Dimensions.get('window');

const theme = {
  colors: {
    primary: '#1A1B1E',
    secondary: '#2A2C31',
    accent: '#FF6B6B',
    background: '#121214',
    card: '#2A2C31',
    text: {
      primary: '#FFFFFF',
      secondary: '#9EA3B0',
      accent: '#FF6B6B'
    }
  }
};

export default function Menu() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Tümü');
  const [menuData, setMenuData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userData, setUserData] = useState(null);
  const [comments, setComments] = useState([]);
  const [selectedItem, setSelectedItem] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const navigation = useNavigation();


  const categories = [
    'Tümü',
    'İçecek',
    'Yiyecek',
    'Tatlı',
    'Atıştırmalık'
  ];


  
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

  useEffect(() => {
    const initializeData = async () => {
      await fetchMenuData();
      await loadFavorites();

    };

    initializeData();
  }, [userData]);

  const loadFavorites = async () => {
    try {
      const favorites = await AsyncStorage.getItem('favorites');
      const favoriteIds = favorites ? JSON.parse(favorites) : [];

      setMenuData(prevData =>
        prevData.map(category => ({
          ...category,
          items: category.items.map(item => ({
            ...item,
            isFavorite: favoriteIds.includes(item.id)
          }))
        }))
      );
    } catch (error) {
      console.error('Error loading favorites:', error);
    }
  };




  const fetchMenuData = async () => {
    try {
      setLoading(true);
      const response = await AppService.getmenu();
      if (response.data) {
        const processedData = processMenuData(response.data);
        setMenuData(processedData);
      }
    } catch (err) {
      setError('Menü yüklenirken bir hata oluştu');
    } finally {
      setLoading(false);
    }
  };



  

  const processMenuData = (data) => {
    const validData = data.map(item => ({
      ...item,
      name: item.ad || 'İsimsiz Ürün',
      description: item.aciklama || 'Açıklama bulunmuyor',
      category: item.kategori || 'Diğer',
      price: item.fiyat || 0,
      image: item.resim ? `https://asebay.com.tr/moods/yonetici/${item.resim}` : 'https://asebay.com.tr/moods/uploads/default-image.jpg',
      isNew: item.isNew || false,
      isPopular: item.one_cikan || false,
      rating: item.ortalama_puan || "0.0",
      ingredients: item.ingredients || [],
      allergens: item.allergens || [],
      reviews: item.yorumlar || []
    }));

    const groupedData = validData.reduce((acc, item) => {
      if (!acc[item.category]) {
        acc[item.category] = {
          id: item.category,
          category: item.category,
          items: []
        };
      }
      acc[item.category].items.push({
        ...item,
        isFavorite: false
      });
      return acc;
    }, {});

    return Object.values(groupedData);
  };

  const toggleFavorite = async (itemId) => {
    if (!userData?.userId) {
      Alert.alert('Uyarı', 'Lütfen önce giriş yapın.', [
        {
          text: 'Giriş Yap',
          onPress: () => navigation.navigate('Login')
        },
        {
          text: 'İptal',
          style: 'cancel'
        }
      ]);
      return;
    }

    try {
      let favorites = await AsyncStorage.getItem('favorites');
      favorites = favorites ? JSON.parse(favorites) : [];

      if (favorites.includes(itemId)) {
        await AppService.removeFavorite(userData.userId, itemId);
        favorites = favorites.filter(id => id !== itemId);
      } else {
        await AppService.addFavorite(userData.userId, itemId);
        favorites.push(itemId);
      }

      await AsyncStorage.setItem('favorites', JSON.stringify(favorites));

      setMenuData(prevData =>
        prevData.map(category => ({
          ...category,
          items: category.items.map(item =>
            item.id === itemId ? { ...item, isFavorite: !item.isFavorite } : item
          )
        }))
      );
    } catch (error) {
      console.error('Error toggling favorite:', error);
      Alert.alert('Hata', 'Favori işlemi sırasında bir hata oluştu.');
    }
  };

  const navigateToFavorites = async () => {
    try {
      const favorites = await AsyncStorage.getItem('favorites');
      if (favorites) {
        const favoriteIds = JSON.parse(favorites);
        const favoriteItems = menuData
          .flatMap(category => category.items)
          .filter(item => favoriteIds.includes(item.id));
        navigation.navigate('Tercihlerim', { favoriteItems });
      }
      else {
        Alert.alert('Uyarı', 'Henüz favori ürününüz bulunmamaktadır.');
      }
    } catch (error) {
      console.error('Error fetching favorites:', error);
    }
  };

  const filteredMenu = menuData.reduce((acc, category) => {
    if (selectedCategory !== 'Tümü' && category.category !== selectedCategory) {
      return acc;
    }

    const filteredItems = category.items.filter(item =>
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description.toLowerCase().includes(searchQuery.toLowerCase())
    );

    if (filteredItems.length > 0) {
      acc.push({
        ...category,
        items: filteredItems,
      });
    }
    return acc;
  }, []);

  if (loading) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <ActivityIndicator size="large" color={theme.colors.accent} />
      </View>
    );
  }

  if (error) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity
          style={styles.retryButton}
          onPress={fetchMenuData}
        >
          <Text style={styles.retryButtonText}>Tekrar Dene</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={theme.colors.primary} />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.headerButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color={theme.colors.text.primary} />
        </TouchableOpacity>

        <Text style={styles.headerTitle}>Menümüz</Text>

        <TouchableOpacity
          style={styles.headerButton}
          onPress={navigateToFavorites}
        >
          <Ionicons name="heart" size={24} color={theme.colors.text.primary} />
        </TouchableOpacity>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <Ionicons
          name="search"
          size={20}
          color={theme.colors.text.secondary}
          style={styles.searchIcon}
        />
        <TextInput
          style={styles.searchInput}
          placeholder="Menüde ara..."
          placeholderTextColor={theme.colors.text.secondary}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      {/* Categories */}
      <View style={styles.categoriesWrapper}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoryContainer}
        >
          {categories.map((category) => (
            <TouchableOpacity
              key={category}
              style={[
                styles.categoryButton,
                selectedCategory === category && styles.categoryButtonActive
              ]}
              onPress={() => setSelectedCategory(category)}
            >
              <Text style={[
                styles.categoryButtonText,
                selectedCategory === category && styles.categoryButtonTextActive
              ]}>
                {category}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Menu Items */}
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.menuContent}
      >
        {filteredMenu.map((category) => (
          <View key={category.id} style={styles.categorySection}>
            <Text style={styles.categoryTitle}>{category.category}</Text>
            {category.items.map((item) => (
              <MenuItem
                key={item.id}
                item={item}
                onToggleFavorite={toggleFavorite}
                onShowComments={() => {
                  setSelectedItem(item);
                  fetchComments(item.id);
                }}
              />
            ))}
          </View>
        ))}
        {filteredMenu.length === 0 && (
          <View style={styles.noResultsContainer}>
            <Ionicons name="search-outline" size={48} color={theme.colors.text.secondary} />
            <Text style={styles.noResultsText}>Sonuç bulunamadı</Text>
            <Text style={styles.noResultsSubText}>Farklı bir arama yapmayı deneyin</Text>
          </View>
        )}
      </ScrollView>

      {/* Comments Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>{selectedItem?.name} Yorumları</Text>
            <ScrollView>
              {comments.map((comment, index) => (
                <View key={index} style={styles.commentContainer}>
                  <Text style={styles.commentText}>{comment.text}</Text>
                  <Text style={styles.commentAuthor}>{comment.author}</Text>
                </View>
              ))}
            </ScrollView>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setModalVisible(false)}
            >
              <Text style={styles.closeButtonText}>Kapat</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: Platform.OS === 'ios' ? 50 : 20,
    paddingHorizontal: 20,
    paddingBottom: 15,
    backgroundColor: theme.colors.primary,
  },
  headerButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.colors.secondary,
    borderRadius: 12,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: theme.colors.text.primary,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.card,
    margin: 16,
    borderRadius: 16,
    height: 50,
    paddingHorizontal: 16,
  },
  searchIcon: {
    marginRight: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: theme.colors.text.primary,
  },
  categoriesWrapper: {
    marginBottom: 16,
  },
  categoryContainer: {
    paddingHorizontal: 16,
    gap: 8,
  },
  categoryButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: theme.colors.card,
    marginRight: 8,
  },
  categoryButtonActive: {
    backgroundColor: theme.colors.accent,
  },
  categoryButtonText: {
    color: theme.colors.text.secondary,
    fontSize: 14,
    fontWeight: '600',
  },
  categoryButtonTextActive: {
    color: theme.colors.text.primary,
  },
  menuContent: {
    paddingHorizontal: 16,
    paddingBottom: 24,
  },
  categorySection: {
    marginBottom: 24,
  },
  categoryTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: theme.colors.text.primary,
    marginBottom: 16,
  },
  centerContent: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    color: theme.colors.text.primary,
    fontSize: 16,
    textAlign: 'center',
  },
  retryButton: {
    marginTop: 16,
    paddingHorizontal: 24,
    paddingVertical: 12,
    backgroundColor: theme.colors.accent,
    borderRadius: 12,
  },
  retryButtonText: {
    color: theme.colors.text.primary,
    fontSize: 16,
    fontWeight: '600',
  },
  noResultsContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 48,
  },
  noResultsText: {
    fontSize: 18,
    fontWeight: '600',
    color: theme.colors.text.primary,
    marginTop: 16,
  },
  noResultsSubText: {
    fontSize: 14,
    color: theme.colors.text.secondary,
    marginTop: 8,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    width: '90%',
    backgroundColor: theme.colors.card,
    borderRadius: 16,
    padding: 16,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: theme.colors.text.primary,
    marginBottom: 16,
  },
  commentContainer: {
    marginBottom: 16,
  },
  commentText: {
    fontSize: 16,
    color: theme.colors.text.primary,
  },
  commentAuthor: {
    fontSize: 14,
    color: theme.colors.text.secondary,
    marginTop: 4,
  },
  closeButton: {
    marginTop: 16,
    paddingHorizontal: 24,
    paddingVertical: 12,
    backgroundColor: theme.colors.accent,
    borderRadius: 12,
    alignSelf: 'center',
  },
  closeButtonText: {
    color: theme.colors.text.primary,
    fontSize: 16,
    fontWeight: '600',
  }
});