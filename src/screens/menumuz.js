import React, { useState, useEffect } from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  Image, 
  TouchableOpacity, 
  FlatList, 
  ScrollView, 
  ActivityIndicator, 
  RefreshControl, 
  Dimensions,
  StatusBar,
  SafeAreaView
} from 'react-native';
import { MaterialIcons, Ionicons } from '@expo/vector-icons'; // Add this import
import AppService from '../api/api';

export default function Menumuz({ navigation }) { // Accept navigation prop
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [menuData, setMenuData] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [showProductDetail, setShowProductDetail] = useState(false);

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
    return validData;
  };

  const fetchMenuData = async () => {
    try {
      setLoading(true);
      const response = await AppService.getmenu();
      if (response.data) {
        const processedData = processMenuData(response.data);
        setMenuData(processedData);
        // Extract unique categories
        const uniqueCategories = [...new Set(processedData.map(item => item.category))];
        setCategories(uniqueCategories);
        // Set initial selected category
        if (uniqueCategories.length > 0 && !selectedCategory) {
          setSelectedCategory(uniqueCategories[0]);
        }
      }
    } catch (err) {
      setError('Menü yüklenirken bir hata oluştu');
      console.error(err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchMenuData();
  };

  useEffect(() => {
    fetchMenuData();
  }, []);

  const filteredMenu = selectedCategory
    ? menuData.filter(item => item.category === selectedCategory)
    : menuData;

  const renderCategoryItem = ({ item }) => (
    <TouchableOpacity
      style={[
        styles.categoryItem,
        selectedCategory === item && styles.selectedCategoryItem
      ]}
      onPress={() => setSelectedCategory(item)}
    >
      <Text 
        style={[
          styles.categoryText, 
          selectedCategory === item && styles.selectedCategoryText
        ]}
      >
        {item}
      </Text>
    </TouchableOpacity>
  );

  const renderMenuItem = ({ item }) => (
    <TouchableOpacity
      style={styles.menuItem}
      onPress={() => {
        setSelectedProduct(item);
        setShowProductDetail(true);
      }}
    >
      <Image
        source={{ uri: item.image }}
        style={styles.menuItemImage}
        resizeMode="cover"
      />
      <View style={styles.menuItemContent}>
        <View>
          <View style={styles.menuItemHeader}>
            <Text style={styles.menuItemName} numberOfLines={1}>
              {item.name}
            </Text>
            <Text style={styles.menuItemPrice}>
              {item.price} ₺
            </Text>
          </View>
          <Text style={styles.menuItemDescription} numberOfLines={2}>
            {item.description}
          </Text>
        </View>
        <View style={styles.menuItemFooter}>
          {item.isPopular && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>
                Popüler
              </Text>
            </View>
          )}
          {item.isNew && (
            <View style={[styles.badge, styles.newBadge]}>
              <Text style={styles.badgeText}>
                Yeni
              </Text>
            </View>
          )}
          <View style={styles.ratingContainer}>
            <Text style={styles.ratingText}>
              <Ionicons name="star" size={14} color="#FFC107" /> {item.rating}
            </Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderProductDetail = () => {
    if (!selectedProduct) return null;
    return (
      <View style={styles.productDetailContainer}>
        <StatusBar barStyle="light-content" />
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => setShowProductDetail(false)}
        >
          <Ionicons name="arrow-back" size={24} color="#FFF" />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.closeButton}
          onPress={() => setShowProductDetail(false)}
        >
          <Text style={styles.closeButtonText}>✕</Text>
        </TouchableOpacity>
        <ScrollView>
          <Image
            source={{ uri: selectedProduct.image }}
            style={styles.productDetailImage}
            resizeMode="cover"
          />
          <View style={styles.productDetailContent}>
            <View style={styles.productDetailHeader}>
              <Text style={styles.productDetailName}>
                {selectedProduct.name}
              </Text>
              <Text style={styles.productDetailPrice}>
                {selectedProduct.price} ₺
              </Text>
            </View>
            <Text style={styles.productDetailDescription}>
              {selectedProduct.description}
            </Text>

            {selectedProduct.ingredients && selectedProduct.ingredients.length > 0 && (
              <View style={styles.sectionContainer}>
                <Text style={styles.sectionTitle}>
                  İçindekiler
                </Text>
                <Text style={styles.sectionContent}>
                  {selectedProduct.ingredients.join(', ')}
                </Text>
              </View>
            )}
            
            {selectedProduct.allergens && selectedProduct.allergens.length > 0 && (
              <View style={styles.sectionContainer}>
                <Text style={styles.sectionTitle}>
                  Alerjenler
                </Text>
                <Text style={styles.sectionContent}>
                  {selectedProduct.allergens.join(', ')}
                </Text>
              </View>
            )}
            
            {selectedProduct.reviews && selectedProduct.reviews.length > 0 && (
              <View style={styles.sectionContainer}>
                <Text style={styles.sectionTitle}>
                  Yorumlar
                </Text>
                {selectedProduct.reviews.map((review, index) => (
                  <View key={index} style={styles.reviewItem}>
                    <Text style={styles.reviewAuthor}>
                      {review.ad_soyad || 'Misafir'}
                    </Text>
                    <Text style={styles.reviewRating}>
                      <Ionicons name="star" size={14} color="#FFC107" /> {review.puan || '5.0'}
                    </Text>
                    <Text style={styles.reviewText}>
                      {review.yorum || ''}
                    </Text>
                  </View>
                ))}
              </View>
            )}
          </View>
        </ScrollView>
      </View>
    );
  };

  if (loading && !refreshing) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#FF6B6B" />
        <Text style={styles.loadingText}>
          Menü yükleniyor...
        </Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.headerBackButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="#FFF" />
        </TouchableOpacity>
        <View>
          <Text style={styles.headerTitle}>Menümüz</Text>
          <Text style={styles.headerSubtitle}>Lezzetli seçeneklerimizi keşfedin</Text>
        </View>
      </View>

      {error ? (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity
            style={styles.retryButton}
            onPress={fetchMenuData}
          >
            <Text style={styles.retryButtonText}>Tekrar Dene</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <>
          <View style={styles.categoriesContainer}>
            <FlatList
              data={categories}
              keyExtractor={(item) => item}
              renderItem={renderCategoryItem}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.categoriesList}
            />
          </View>

          <FlatList
            data={filteredMenu}
            keyExtractor={(item, index) => `menu-item-${index}`}
            renderItem={renderMenuItem}
            contentContainerStyle={styles.menuList}
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={["#FF6B6B"]} />
            }
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>
                  {selectedCategory
                    ? `Bu kategoride ürün bulunamadı: ${selectedCategory}`
                    : 'Menüde gösterilecek ürün bulunamadı'}
                </Text>
              </View>
            }
          />
        </>
      )}
      {showProductDetail && renderProductDetail()}
    </SafeAreaView>
  );
}

const { width } = Dimensions.get('window');
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#495057',
  },
  header: {
    padding: 20,
    backgroundColor: '#FF6B6B',
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerBackButton: {
    marginRight: 15,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFF',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#FFF',
    opacity: 0.9,
    marginTop: 4,
  },
  categoriesContainer: {
    backgroundColor: '#FFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    zIndex: 1,
  },
  categoriesList: {
    padding: 12,
  },
  categoryItem: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    marginHorizontal: 6,
    borderRadius: 20,
    backgroundColor: '#F8F9FA',
    borderWidth: 1,
    borderColor: '#E9ECEF',
  },
  selectedCategoryItem: {
    backgroundColor: '#FF6B6B',
    borderColor: '#FF6B6B',
  },
  categoryText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#495057',
  },
  selectedCategoryText: {
    color: '#FFF',
  },
  menuList: {
    padding: 15,
    paddingBottom: 30,
  },
  menuItem: {
    flexDirection: 'row',
    backgroundColor: '#FFF',
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  menuItemImage: {
    width: 110,
    height: 110,
  },
  menuItemContent: {
    flex: 1,
    padding: 14,
    justifyContent: 'space-between',
  },
  menuItemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  menuItemName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#212529',
    flex: 1,
    marginRight: 8,
  },
  menuItemPrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FF6B6B',
  },
  menuItemDescription: {
    fontSize: 13,
    color: '#6C757D',
    marginTop: 6,
    marginBottom: 8,
    lineHeight: 18,
  },
  menuItemFooter: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  badge: {
    backgroundColor: '#FF6B6B',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
    marginRight: 8,
  },
  newBadge: {
    backgroundColor: '#4CAF50',
  },
  badgeText: {
    color: '#FFF',
    fontSize: 10,
    fontWeight: 'bold',
  },
  ratingContainer: {
    marginLeft: 'auto',
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingText: {
    fontSize: 12,
    color: '#495057',
    fontWeight: 'bold',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    color: '#DC3545',
    textAlign: 'center',
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: '#FF6B6B',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#FFF',
    fontWeight: 'bold',
  },
  emptyContainer: {
    padding: 40,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#6C757D',
    textAlign: 'center',
  },
  productDetailContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#FFF',
    zIndex: 2,
  },
  backButton: {
    position: 'absolute',
    top: 40,
    left: 15,
    zIndex: 3,
    backgroundColor: 'rgba(0,0,0,0.5)',
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButton: {
    position: 'absolute',
    top: 40,
    right: 15,
    zIndex: 3,
    backgroundColor: 'rgba(0,0,0,0.5)',
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  productDetailImage: {
    width: '100%',
    height: 250,
  },
  productDetailContent: {
    padding: 20,
  },
  productDetailHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  productDetailName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#212529',
    flex: 1,
    marginRight: 10,
  },
  productDetailPrice: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#FF6B6B',
  },
  productDetailDescription: {
    fontSize: 16,
    lineHeight: 24,
    color: '#495057',
    marginBottom: 20,
  },
  sectionContainer: {
    marginBottom: 20,
    backgroundColor: '#F8F9FA',
    padding: 15,
    borderRadius: 10,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#212529',
    marginBottom: 10,
  },
  sectionContent: {
    fontSize: 15,
    color: '#6C757D',
    lineHeight: 22,
  },
  reviewItem: {
    backgroundColor: '#FFF',
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#E9ECEF',
  },
  reviewAuthor: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#212529',
  },
  reviewRating: {
    fontSize: 12,
    color: '#495057',
    fontWeight: 'bold',
    marginTop: 4,
    marginBottom: 6,
  },
  reviewText: {
    fontSize: 14,
    color: '#495057',
    lineHeight: 20,
  }
});