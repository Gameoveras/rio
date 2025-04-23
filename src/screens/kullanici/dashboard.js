import { StyleSheet, Text, View, Image, TouchableOpacity, FlatList, ScrollView, Animated, Dimensions, StatusBar, Platform, ActivityIndicator } from 'react-native';
import React, { useState, useEffect, useRef, useContext } from 'react';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { LinearGradient } from 'expo-linear-gradient';
import AppService from '../../api/api';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

const HEADER_MAX_HEIGHT = 125;
const HEADER_MIN_HEIGHT = 80;
const HEADER_SCROLL_DISTANCE = HEADER_MAX_HEIGHT - HEADER_MIN_HEIGHT;

export default function Dashboard({ navigation, route }) {
  const [timeGreeting, setTimeGreeting] = useState('');
  const [activeSlide, setActiveSlide] = useState(0);
  const [coffeeMenu, setCoffeeMenu] = useState([]);
  const [popularItems, setPopularItems] = useState([]);
  const [sliderItems, setSliderItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const scrollY = useRef(new Animated.Value(0)).current;
  const flatListRef = useRef(null);


  // Animasyon değerleri
  const headerHeight = scrollY.interpolate({
    inputRange: [0, HEADER_SCROLL_DISTANCE],
    outputRange: [HEADER_MAX_HEIGHT, HEADER_MIN_HEIGHT],
    extrapolate: 'clamp',
  });

  const headerOpacity = scrollY.interpolate({
    inputRange: [0, HEADER_SCROLL_DISTANCE / 2, HEADER_SCROLL_DISTANCE],
    outputRange: [1, 0.5, 0],
    extrapolate: 'clamp',
  });

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 6) setTimeGreeting('İyi Geceler 🌙');
    else if (hour < 12) setTimeGreeting('Günaydın ☀️');
    else if (hour < 19) setTimeGreeting('İyi Günler 🌤');
    else setTimeGreeting('İyi Akşamlar 🌙');

    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [
        kampanyaResponse, 
        oneCikanResponse, 
        encokYorumlananResponse
      ] = await Promise.all([
        AppService.getkampanya(),
        AppService.getmenuonecikan(),
        AppService.encokyorumlanan()
      ]);

      if (kampanyaResponse.success) setSliderItems(kampanyaResponse.data);
      if (oneCikanResponse.success) setCoffeeMenu(oneCikanResponse.data);
      if (encokYorumlananResponse.success) setPopularItems(encokYorumlananResponse.data);

    } catch (error) {
      console.error("API Error:", error);
      setError('Veriler yüklenirken bir hata oluştu.');
    } finally {
      setLoading(false);
    }
  };

  const RatingStars = ({ rating }) => {
    // Ensure rating is a valid number and between 0-5
    const safeRating = Math.min(Math.max(parseFloat(rating) || 0, 0), 5);
    const stars = [];
    
    // Generate star icons
    for (let i = 1; i <= 5; i++) {
      if (i <= safeRating) {
        stars.push(<Icon key={`star-${i}`} name="star" size={16} color="#FFD700" />);
      } else if (i - 0.5 <= safeRating) {
        stars.push(<Icon key={`star-${i}`} name="star-half" size={16} color="#FFD700" />);
      } else {
        stars.push(<Icon key={`star-${i}`} name="star-border" size={16} color="#FFD700" />);
      }
    }
  
    return (
      <View style={styles.ratingContainer}>
        {stars}
        <Text style={styles.ratingText}>{safeRating.toFixed(1)}</Text>
      </View>
    );
  };
  
  const renderSliderItem = ({ item }) => (
    <TouchableOpacity 
      style={styles.slide}
      activeOpacity={0.9}
      onPress={() => navigation.navigate('promodetail', { item })}
    >
      <Image 
        source={{ uri: `https://Asebay.com.tr/moods/yonetici/uploads/${item.on_resmi}` }}  
        style={styles.sliderImage} 
      />
      <LinearGradient
        colors={['transparent', 'rgba(0,0,0,0.8)']}
        style={styles.sliderGradient}
      >
        <Text style={styles.sliderTitle}>{item.baslik}</Text>
        <Text style={styles.sliderDescription}>{item.on_aciklama}</Text>
      </LinearGradient>
    </TouchableOpacity>
  );
  
  const renderCoffeeItem = ({ item }) => (
    <TouchableOpacity 
      style={styles.coffeeCard} 
      activeOpacity={0.8}
      onPress={() => navigation.navigate('CoffeeDetail', { item })}
    >
      <Image 
        source={{ uri: `https://Asebay.com.tr/moods/yonetici/${item.resim}` }}  
        style={styles.coffeeImage} 
      />
      <View style={styles.coffeeInfo}>
        <Text style={styles.coffeeName}>{item.menu_adi}</Text>
        <Text style={styles.coffeeDescription} numberOfLines={2}>{item.aciklama}</Text>
        <View style={styles.coffeeStats}>
          <RatingStars rating={parseFloat(item.ortalama_yildiz)} />
          <Text style={styles.calories}>{item.kalori} kcal</Text>
        </View>
        <View style={styles.priceRow}>
          <Text style={styles.coffeePrice}>₺{item.fiyat}</Text>
          
        </View>
      </View>
    </TouchableOpacity>
  );
  
  const renderPopularItem = ({ item }) => (
    <TouchableOpacity 
      style={styles.popularCard} 
      activeOpacity={0.8}
      onPress={() => navigation.navigate('CoffeeDetail', { item })}
    >
      <Image 
        source={{ uri: `https://Asebay.com.tr/moods/yonetici/${item.resim}` }} 
        style={styles.popularImage} 
      />
      <View style={styles.popularInfo}>
        <Text style={styles.popularName}>{item.menu_adi}</Text>
        <Text style={styles.popularDescription} numberOfLines={2}>{item.aciklama}</Text>
        <View style={styles.popularStats}>
          <RatingStars rating={parseFloat(item.ortalama_yildiz)} />
          <Text style={styles.popularReviews}>{item.yorum_sayisi} yorum</Text>
        </View>
        <View style={styles.popularFooter}>
          <Text style={styles.calories}>{item.kalori} kcal</Text>
          <Text style={styles.popularPrice}>₺{item.fiyat}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
  

  const renderDotIndicator = () => (
    <View style={styles.paginationDots}>
      {sliderItems.map((_, index) => (
        <View
          key={index}
          style={[
            styles.dot,
            { backgroundColor: index === activeSlide ? '#6F4E37' : '#D3D3D3' }
          ]}
        />
      ))}
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#6F4E37" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />
      
      <Animated.ScrollView
        contentContainerStyle={styles.scrollViewContent}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: false }
        )}
        scrollEventThrottle={16}
      >
        <Animated.View style={[styles.header, { height: headerHeight, opacity: headerOpacity }]}>
          <View>
            <Text style={styles.greeting}>{timeGreeting}</Text>
            <Text style={styles.subGreeting}>Bugün nasıl yardımcı olabiliriz?</Text>
          </View>
          <View style={styles.headerButtons}>
            <TouchableOpacity 
              style={styles.favoritesButton}
              onPress={() => navigation.navigate('Tercihlerim')}
            >
              <Icon name="favorite" size={24} color="#6F4E37" />
              <Text style={styles.headerButtonText}>Favorilerim</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.profileButton}
              onPress={() => navigation.navigate('Hesabim')}
            >
              <Icon name="account-circle" size={40} color="#6F4E37" />
            </TouchableOpacity>
          </View>
        </Animated.View>
  
        <View style={styles.content}>
          <View style={styles.sliderContainer}>
            <FlatList
              ref={flatListRef}
              data={sliderItems}
              renderItem={renderSliderItem}
              horizontal
              pagingEnabled
              showsHorizontalScrollIndicator={false}
              onMomentumScrollEnd={(event) => {
                const slideSize = event.nativeEvent.layoutMeasurement.width;
                const index = Math.round(event.nativeEvent.contentOffset.x / slideSize);
                setActiveSlide(index);
              }}
            />
            {renderDotIndicator()}
          </View>
  
          <View style={styles.menuSection}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Öne Çıkan Lezzetlerimiz</Text>
              <TouchableOpacity onPress={() => navigation.navigate('Menu')}>
                <Text style={styles.seeAllButton}>Tümünü Gör</Text>
              </TouchableOpacity>
            </View>
            <FlatList
              data={coffeeMenu}
              renderItem={renderCoffeeItem}
              keyExtractor={item => item.menu_id.toString()}
              horizontal
              showsHorizontalScrollIndicator={false}
            />
          </View>
  
          <View style={[styles.menuSection, styles.lastSection]}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>En Çok Yorumlananlar</Text>
            </View>
            <FlatList
              data={popularItems}
              renderItem={renderPopularItem}
              keyExtractor={item => item.menu_id.toString()}
              horizontal
              showsHorizontalScrollIndicator={false}
            />
          </View>
        </View>
      </Animated.ScrollView>
  
      <View style={styles.tabBar}>
        <TouchableOpacity style={styles.tabItem}>
          <Icon name="home" size={24} color="#6F4E37" />
          <Text style={styles.tabText}>Ana Sayfa</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={styles.tabItem}
          onPress={() => navigation.navigate('Menu')}
        >
          <Icon name="search" size={24} color="#6F4E37" />
          <Text style={styles.tabText}>Keşfet</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.tabItem, styles.qrButton]}
          onPress={() => navigation.navigate('Qr')}
        >
          <Icon name="qr-code-scanner" size={40} color="#FFF" />
        </TouchableOpacity>
        <TouchableOpacity 
          style={styles.tabItem}
          onPress={() => navigation.navigate('Kampanyalar')}
        >
          <Icon name="local-offer" size={24} color="#6F4E37" />
          <Text style={styles.tabText}>Kampanyalar</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={styles.tabItem}
          onPress={() => navigation.navigate('Hesabim')}
        >
          <Icon name="person" size={24} color="#6F4E37" />
          <Text style={styles.tabText}>Profil</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const TAB_BAR_HEIGHT = Platform.OS === 'ios' ? 85 : 65; // Tab bar yüksekliği


const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F8F8',
  },
  scrollViewContent: {
    flexGrow: 1,
    paddingBottom: TAB_BAR_HEIGHT + 20, // Tab bar yüksekliği + extra padding
  },
  content: {
    flex: 1,
    backgroundColor: '#F8F8F8',
  },
  lastSection: {
    marginBottom: 20, // Son section için extra margin
  },

  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingTop: Platform.OS === 'ios' ? 50 : 40,
    paddingHorizontal: 16,
    backgroundColor: '#FFF',
    borderBottomLeftRadius: 20, // Reduced from 30
    borderBottomRightRadius: 20, // Reduced from 30
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1, // Reduced shadow
    },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 3,
    marginTop: 20, // Added margin bottom
  },
  headerButtons: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  favoritesButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    marginRight: 10,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  headerButtonText: {
    marginLeft: 5,
    fontSize: 14,
    color: '#6F4E37',
    fontWeight: '600',
  },
  popularCard: {
    backgroundColor: '#FFF',
    borderRadius: 15,
    marginRight: 15,
    width: 300,
    flexDirection: 'row',
    padding: 10,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  popularImage: {
    width: 80,
    height: 80,
    borderRadius: 10,
  },
  popularInfo: {
    flex: 1,
    marginLeft: 12,
    justifyContent: 'space-between',
  },
  popularName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  popularOrderCount: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  popularStats: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginVertical: 5,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 10,
  },
  popularPrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#6F4E37',
  },
  popularList: {
    paddingRight: 20,
  },
  qrButton: {
    backgroundColor: '#6F4E37',
    width: 70, // Büyütüldü
    height: 70, // Büyütüldü
    borderRadius: 35,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: -35,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
    elevation: 8,
  },

  greeting: {
    fontSize: 24, // Reduced from 28
    fontWeight: 'bold',
    color: '#6F4E37',
    marginBottom: 4,
  },
  subGreeting: {
    fontSize: 14, // Reduced from 16
    color: '#666',
  },
 
  profileButton: {
    padding: 5,
  },
  content: {
    paddingTop: 20,
  },
   // Slider container adjustments
   sliderContainer: {
    height: 160, // Reduced from 200
    marginBottom: 20, // Reduced from 30
  },
  slide: {
    width: screenWidth - 32, // Using 32 instead of 40 for margins
    height: 160, // Reduced from 200
    marginHorizontal: 16,
    borderRadius: 16, // Reduced from 20
    overflow: 'hidden',
  },
  sliderImage: {
    width: '100%',
    height: '100%',
  },
  sliderGradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '50%',
    padding: 20,
    justifyContent: 'flex-end',
  },
  sliderTitle: {
    color: '#FFF',
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  sliderDescription: {
    color: '#FFF',
    fontSize: 14,
  },
  paginationDots: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginHorizontal: 4,
  },
  menuSection: {
    paddingHorizontal: 16, // Reduced from 20
    marginBottom: 20, // Added margin bottom
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12, // Reduced from 15
  },
  sectionTitle: {
    fontSize: 20, // Reduced from 22
    fontWeight: 'bold',
    color: '#6F4E37',
  },
  seeAllButton: {
    color: '#6F4E37',
    fontSize: 14,
    fontWeight: '600',
  },
  coffeeList: {
    paddingRight: 20,
  },
   ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  ratingText: {
    marginLeft: 4,
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  coffeeCard: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    marginRight: 16,
    width: 300,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
    overflow: 'hidden',
  },
  coffeeImage: {
    width: '100%',
    height: 180,
  },
  coffeeInfo: {
    padding: 16,
  },
  coffeeName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  coffeeDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 12,
    lineHeight: 20,
  },
  coffeeStats: {
    marginBottom: 12,
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  coffeePrice: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#6F4E37',
  },
  orderButton: {
    backgroundColor: '#6F4E37',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  orderButtonText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '600',
  },
  popularCard: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    marginRight: 16,
    width: 320,
    flexDirection: 'row',
    padding: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  popularImage: {
    width: 100,
    height: 100,
    borderRadius: 12,
  },
  popularInfo: {
    flex: 1,
    marginLeft: 12,
  },
  popularName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 6,
  },
  popularDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
    lineHeight: 20,
  },
  popularStats: {
    marginBottom: 8,
  },
  popularReviews: {
    fontSize: 12,
    color: '#666',
    marginLeft: 8,
  },
  popularFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  popularPrice: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#6F4E37',
  },
  calories: {
    fontSize: 12,
    color: '#666',
  },
  priceContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  coffeePrice: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#6F4E37',
  },
  addButton: {
    backgroundColor: '#6F4E37',
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  tabBar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    backgroundColor: '#FFF',
    paddingVertical: 10,
    paddingBottom: Platform.OS === 'ios' ? 25 : 15,
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: -3,
    },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 10,
  },
  tabItem: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  qrButton: {
    backgroundColor: '#6F4E37',
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: -30,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
    elevation: 8,
  },
  tabText: {
    marginTop: 5,
    fontSize: 12,
    color: '#6F4E37',
  },
});