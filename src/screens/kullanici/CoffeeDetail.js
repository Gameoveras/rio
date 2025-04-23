import { StyleSheet, Text, View, Image, ScrollView, TouchableOpacity, Dimensions, Platform, StatusBar, Animated, Alert,TextInput,Easing } from 'react-native'
import React, { useEffect, useRef, useState } from 'react'
import Icon from 'react-native-vector-icons/MaterialIcons';
import { LinearGradient } from 'expo-linear-gradient';
import AppService from '../../api/api';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

const HEADER_HEIGHT = Platform.OS === 'ios' ? 88 : 64;
const HEADER_MAX_HEIGHT = screenHeight * 0.45;
const HEADER_MIN_HEIGHT = HEADER_HEIGHT;
const HEADER_SCROLL_DISTANCE = HEADER_MAX_HEIGHT - HEADER_MIN_HEIGHT;

export default function CoffeeDetail({ navigation, route }) {
  const { item } = route.params
  const [isFavorite, setIsFavorite] = useState(false)
  const [selectedSize, setSelectedSize] = useState('small')
  const [userData, setUserData] = useState({ userId: '' })
  const [comment, setComment] = useState('')
  const [rating, setRating] = useState(0)
  const scrollY = useRef(new Animated.Value(0)).current
  const scaleAnim = useRef(new Animated.Value(1)).current


  

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
    const fetchFavoriteStatus = async () => {
      try {
        // Fetch favorites from local storage
        const favorites = await AsyncStorage.getItem('favorites');
        if (favorites) {
          const favoritesArray = JSON.parse(favorites);
          const isFavorited = favoritesArray.includes(item.menu_id);
          setIsFavorite(isFavorited);
        }
      } catch (error) {
        console.error('Favori durumu alınamadı:', error);
      }
    };
  
    fetchFavoriteStatus();
  }, [item.menu_id]);
  
  const handleAddFavorite = async () => {
    // Check if the user is logged in
    if (!userData.userId) {
      Alert.alert('Uyarı', 'Lütfen önce giriş yapın.', [
        {
          text: 'Giriş Yap',
          onPress: () => navigation.navigate('Login'),
        },
        {
          text: 'İptal',
          style: 'cancel',
        },
      ]);
      return;
    }
  
    try {
      // Fetch current favorites from local storage
      const favorites = await AsyncStorage.getItem('favorites');
      let favoritesArray = favorites ? JSON.parse(favorites) : [];
  
      // Toggle favorite status
      if (isFavorite) {
        // Remove from favorites
        await AppService.removeFavorite(userData.userId, item.menu_id); // Call backend to remove
        favoritesArray = favoritesArray.filter((id) => id !== item.menu_id);
      } else {
        // Add to favorites
        await AppService.addFavorite(userData.userId, item.menu_id); // Call backend to add
        favoritesArray.push(item.menu_id);
      }
  
      // Update local storage
      await AsyncStorage.setItem('favorites', JSON.stringify(favoritesArray));
      setIsFavorite(!isFavorite); // Toggle local state
      Alert.alert('Başarılı', isFavorite ? 'Favorilerden çıkarıldı' : 'Favorilere eklendi');
    } catch (error) {
      console.error('İşlem sırasında bir hata oluştu:', error);
      Alert.alert('Hata', 'İşlem sırasında bir hata oluştu');
    }
  };

  
  

  const handleAddComment = async () => {
    if (!userData.userId) {
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
  
    if (comment.trim() === '' || rating === 0) {
      Alert.alert('Uyarı', 'Lütfen yorumunuzu ve yıldız derecelendirmenizi girin.');
      return;
    }
  
    try {
      const response = await AppService.addComment(userData.userId, item.menu_id, comment, rating);
      if (response.success) {
        Alert.alert('Başarılı', 'Yorumunuz eklendi.');
        setComment('');
        setRating(0);
      } else {
        Alert.alert('Hata', response.message || 'Bir hata oluştu');
      }
    } catch (error) {
      Alert.alert('Hata', 'İşlem sırasında bir hata oluştu');
    }
  };

 // Animasyonlu header efektleri
 const headerTranslateY = scrollY.interpolate({
  inputRange: [0, 180],
  outputRange: [0, -100],
  extrapolate: 'clamp',
})

const headerOpacity = scrollY.interpolate({
  inputRange: [0, 150],
  outputRange: [1, 0],
  extrapolate: 'clamp',
})

const imageScale = scrollY.interpolate({
  inputRange: [-screenHeight, 0],
  outputRange: [3, 1],
  extrapolateRight: 'clamp',
})

// Boyut seçim animasyonu
const animateSizeSelection = (size) => {
  Animated.sequence([
    Animated.timing(scaleAnim, {
      toValue: 0.95,
      duration: 80,
      easing: Easing.ease,
      useNativeDriver: true
    }),
    Animated.timing(scaleAnim, {
      toValue: 1,
      duration: 120,
      easing: Easing.ease,
      useNativeDriver: true
    })
  ]).start(() => setSelectedSize(size))
}

// Yıldız animasyonu
const animateStar = (index) => {
  const starScale = new Animated.Value(1)
  
  Animated.sequence([
    Animated.timing(starScale, {
      toValue: 1.4,
      duration: 80,
      useNativeDriver: true
    }),
    Animated.timing(starScale, {
      toValue: 1,
      duration: 120,
      useNativeDriver: true
    })
  ]).start()

  return starScale
}

return (
  <View style={styles.container}>
    <StatusBar barStyle="light-content" />

    {/* Floating Header */}
    <Animated.View style={[styles.header, {
      transform: [{ translateY: headerTranslateY }],
      opacity: headerOpacity
    }]}>
      <LinearGradient
        colors={['rgba(28,28,30,0.9)', 'rgba(28,28,30,0.6)']}
        style={styles.headerBackground}
      />
      
      <TouchableOpacity 
        style={styles.headerButton}
        onPress={() => navigation.goBack()}
      >
        <Icon name="arrow-back" size={28} color="#FFF" />
      </TouchableOpacity>

      <Animated.Text style={styles.headerTitle}>
        {item?.menu_adi}
      </Animated.Text>

      <TouchableOpacity 
        style={styles.headerButton}
        onPress={handleAddFavorite}
      >
        <Icon 
          name={isFavorite ? "favorite" : "favorite-border"} 
          size={28} 
          color={isFavorite ? "#FF406E" : "#FFF"} 
        />
      </TouchableOpacity>
    </Animated.View>

    <ScrollView
      contentContainerStyle={styles.scrollContainer}
      onScroll={Animated.event(
        [{ nativeEvent: { contentOffset: { y: scrollY } } }],
        { useNativeDriver: false }
      )}
      scrollEventThrottle={16}
    >
      {/* Hero Image Section */}
      <Animated.View style={[styles.imageContainer, {
        transform: [{ scale: imageScale }]
      }]}>
        <Image
          source={{ uri: `https://Asebay.com.tr/moods/yonetici/${item?.resim}` }}
          style={styles.coffeeImage}
          resizeMode="cover"
        />
        <LinearGradient
          colors={['transparent', 'rgba(28,28,30,0.9)']}
          style={styles.imageGradient}
        />
      </Animated.View>

      {/* Content Container */}
      <View style={styles.contentContainer}>
        <View style={styles.priceCard}>
  {/* Fiyat ve Sayısal Değer */}
  <View style={styles.priceRow}>
    <Text style={styles.priceLabel}>Fiyat</Text>
    <Text style={styles.priceValue}>₺{Math.floor(item?.fiyat)}</Text>
  </View>

  
</View>

        {/* Description Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>KAHVE DETAYLARI</Text>
          <Text style={styles.description}>
            {item?.aciklama}
          </Text>
        </View>


        {/* Rating Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>DEĞERLENDİR</Text>
          <View style={styles.ratingContainer}>
            {[1, 2, 3, 4, 5].map((star) => {
              const starScale = animateStar(star)
              return (
                <TouchableOpacity
                  key={star}
                  onPress={() => setRating(star)}
                >
                  <Animated.View style={{ transform: [{ scale: starScale }] }}>
                    <Icon
                      name={star <= rating ? "star" : "star-outline"}
                      size={40}
                      color={star <= rating ? "#FFD93D" : "#5E5E5E"}
                    />
                  </Animated.View>
                </TouchableOpacity>
              )
            })}
          </View>
        </View>

        {/* Comment Section */}
        <View style={styles.section}>
          <TextInput
            style={styles.commentInput}
            placeholder="Yorumunuzu buraya yazın..."
            placeholderTextColor="#8E8E93"
            multiline
            numberOfLines={4}
            value={comment}
            onChangeText={setComment}
          />
          <TouchableOpacity 
            style={styles.submitButton}
            onPress={handleAddComment}
          >
            <LinearGradient
              colors={['#FF406E', '#FF81A6']}
              style={styles.gradientButton}
            >
              <Text style={styles.buttonText}>YORUMU GÖNDER</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  </View>
)
}

const styles = StyleSheet.create({
container: {
  flex: 1,
  backgroundColor: '#1C1C1E'
},
header: {
  position: 'absolute',
  top: 0,
  left: 0,
  right: 0,
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'space-between',
  paddingTop: Platform.OS === 'ios' ? 50 : 30,
  paddingHorizontal: 20,
  height: 100,
  zIndex: 100
},
headerBackground: {
  ...StyleSheet.absoluteFillObject,
  borderBottomLeftRadius: 20,
  borderBottomRightRadius: 20
},
headerButton: {
  width: 40,
  height: 40,
  borderRadius: 20,
  justifyContent: 'center',
  alignItems: 'center',
  backgroundColor: 'rgba(255,255,255,0.1)'
},
headerTitle: {
  color: '#FFF',
  fontSize: 18,
  fontWeight: '600',
  letterSpacing: 0.5
},
scrollContainer: {
  paddingBottom: 100
},
imageContainer: {
  height: screenHeight * 0.6,
  marginBottom: 50
},
coffeeImage: {
  width: '100%',
  height: '100%'
},
imageGradient: {
  ...StyleSheet.absoluteFillObject
},
contentContainer: {
  paddingHorizontal: 20,
  marginTop: -40
},
priceCard: {
  backgroundColor: '#2C2C2E',
  borderRadius: 20,
  padding: 20,
  marginBottom: 30,
  shadowColor: '#000',
  shadowOffset: { width: 0, height: 5 },
  shadowOpacity: 0.2,
  shadowRadius: 10,
  elevation: 5
},
priceRow: {
  flexDirection: 'row', // Fiyat metni ve sayısal değeri yatayda sırala
  justifyContent: 'space-between', // Metni sola, sayıyı sağa hizala
  alignItems: 'center', // Dikeyde ortala
  marginBottom: 15 // Boyut seçenekleri ile arasına boşluk ekle
},
priceLabel: {
  color: '#fff',
  fontSize: 22, // Fiyat metnini büyült
  fontWeight: '500',
  fontFamily: 'Avenir'
},
priceValue: {
  color: '#FFD93D',
  fontSize: 32,
  fontWeight: '700'
},
sizeContainer: {
  flexDirection: 'row', // Boyut seçeneklerini yatayda sırala
  gap: 10,
  justifyContent: 'center' // Boyut seçeneklerini ortala
},
sizeButton: {
  paddingVertical: 10,
  paddingHorizontal: 20,
  borderRadius: 15,
  backgroundColor: '#3A3A3C',
  alignItems: 'center',
  justifyContent: 'center'
},
selectedSize: {
  backgroundColor: '#FF406E'
},
sizeText: {
  color: '#FFF',
  fontSize: 14,
  fontWeight: '500'
},
selectedSizeText: {
  color: '#FFF'
},
section: {
  marginBottom: 30
},
sectionTitle: {
  color: '#8E8E93',
  fontSize: 13,
  fontWeight: '500',
  letterSpacing: 1,
  marginBottom: 15
},
description: {
  color: '#FFF',
  fontSize: 16,
  lineHeight: 24,
  letterSpacing: 0.3
},
ingredientsGrid: {
  flexDirection: 'row',
  flexWrap: 'wrap',
  gap: 12
},
ingredientCard: {
  flexDirection: 'row',
  alignItems: 'center',
  backgroundColor: '#2C2C2E',
  borderRadius: 12,
  paddingVertical: 10,
  paddingHorizontal: 15,
  gap: 8
},
ingredientIcon: {
  backgroundColor: '#FF406E',
  borderRadius: 8,
  padding: 5
},
ingredientText: {
  color: '#FFF',
  fontSize: 14
},
ratingContainer: {
  flexDirection: 'row',
  justifyContent: 'center',
  gap: 15,
  marginVertical: 20
},
commentInput: {
  backgroundColor: '#2C2C2E',
  borderRadius: 15,
  padding: 20,
  color: '#FFF',
  fontSize: 16,
  minHeight: 120,
  textAlignVertical: 'top',
  marginBottom: 20
},
submitButton: {
  borderRadius: 15,
  overflow: 'hidden'
},
gradientButton: {
  paddingVertical: 18,
  alignItems: 'center',
  justifyContent: 'center'
},
buttonText: {
  color: '#FFF',
  fontSize: 16,
  fontWeight: '600',
  letterSpacing: 0.5
}
})