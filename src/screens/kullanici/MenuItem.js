import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Image,
  Animated,
  Dimensions,
  ScrollView
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width } = Dimensions.get('window');
const CARD_WIDTH = width * 0.92;

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
    },
    white: '#FFFFFF',
    success: '#4CAF50',
    warning: '#FFC107',
    error: '#F44336',
    rating: '#FFD700',
    reviewBg: '#1F2023'
  }
};

const MenuItem = ({ item, onToggleFavorite }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [animation] = useState(new Animated.Value(0));

  const toggleExpand = () => {
    Animated.spring(animation, {
      toValue: isExpanded ? 0 : 1,
      useNativeDriver: false,
      friction: 8,
    }).start();
    setIsExpanded(!isExpanded);
  };

  const maxHeight = animation.interpolate({
    inputRange: [0, 1],
    outputRange: [280, 800] // Increased max height for expanded content
  });

  const renderStarRating = (rating) => {
    return (
      <View style={styles.ratingContainer}>
        {[...Array(5)].map((_, i) => (
          <Ionicons
            key={i}
            name={i < rating ? "star" : "star-outline"}
            size={16}
            color={theme.colors.rating}
            style={styles.starIcon}
          />
        ))}
      </View>
    );
  };

  const renderReviews = () => (
    <View style={styles.reviewsSection}>
      <View style={styles.reviewsHeader}>
        <Text style={styles.sectionTitle}>Müşteri Yorumları</Text>
        <View style={styles.overallRating}>
          <Text style={styles.ratingText}>{item.rating}</Text>
          {renderStarRating(parseFloat(item.rating))}
          <Text style={styles.totalReviews}>
            ({item.reviews?.length || 0} yorum)
          </Text>
        </View>
      </View>
      
      <ScrollView style={styles.reviewsScroll}>
        <View style={styles.reviewsList}>
          {item.reviews?.map((review, index) => (
            <View key={index} style={styles.reviewItem}>
              <View style={styles.reviewHeader}>
                <View style={styles.reviewUserInfo}>
                  <View style={styles.userAvatar}>
                    <Text style={styles.userInitial}>
                      {review.ad_soyad?.charAt(0).toUpperCase()}
                    </Text>
                  </View>
                  <View style={styles.userDetails}>
                    <Text style={styles.reviewUserName}>{review.ad_soyad}</Text>
                    {renderStarRating(review.yildiz_puani)}
                  </View>
                </View>
              </View>
              <Text style={styles.reviewText}>{review.yorum}</Text>
            </View>
          ))}
        </View>
      </ScrollView>
    </View>
);

  return (
    <Animated.View style={[styles.menuItemCard, { maxHeight }]}>
      <TouchableOpacity 
        style={styles.itemImageContainer}
        onPress={toggleExpand}
        activeOpacity={0.9}
      >
        <Image
          source={{ uri: item.image }}
          style={styles.itemImage}
          resizeMode="cover"
        />
        <TouchableOpacity 
          style={styles.favoriteButton}
          onPress={() => onToggleFavorite(item.id)}
        >
          <Ionicons 
            name={item.isFavorite ? 'heart' : 'heart-outline'} 
            size={24} 
            color={item.isFavorite ? theme.colors.accent : theme.colors.white} 
          />
        </TouchableOpacity>
        
        <View style={styles.badgeContainer}>
          {item.isNew && (
            <View style={[styles.badge, styles.newBadge]}>
              <Text style={styles.badgeText}>Yeni</Text>
            </View>
          )}
          {item.isPopular && (
            <View style={[styles.badge, styles.popularBadge]}>
              <Text style={styles.badgeText}>Popüler</Text>
            </View>
          )}
        </View>
      </TouchableOpacity>

      <View style={styles.itemContent}>
        <View style={styles.itemHeader}>
          <View style={styles.titleContainer}>
            <Text style={styles.itemName}>{item.name}</Text>
            <Text style={styles.itemPrice}>₺{item.price}</Text>
          </View>
          
          <Text style={styles.itemDescription}>{item.description}</Text>

          <View style={styles.statsContainer}>
            <View style={styles.statItem}>
              <Ionicons name="time-outline" size={18} color={theme.colors.text.secondary} />
              <Text style={styles.statText}>{item.preparationTime}</Text>
            </View>
            <View style={styles.statItem}>
              <Ionicons name="flame-outline" size={18} color={theme.colors.text.secondary} />
              <Text style={styles.statText}>{item.kalori} kcal</Text>
            </View>
            <View style={styles.statItem}>
              <Ionicons name="star" size={18} color={theme.colors.rating} />
              <Text style={styles.statText}>{item.rating}</Text>
            </View>
          </View>
        </View>

        {isExpanded && (
          <View style={styles.expandedContent}>
            {item.ingredients?.length > 0 && (
              <View style={styles.ingredientsSection}>
                <Text style={styles.sectionTitle}>İçindekiler</Text>
                <View style={styles.ingredientsGrid}>
                  {item.ingredients?.map((ingredient, index) => (
                    <View key={index} style={styles.ingredientItem}>
                      <Ionicons name="checkmark-circle" size={16} color={theme.colors.success} />
                      <Text style={styles.ingredientText}>{ingredient}</Text>
                    </View>
                  ))}
                </View>
              </View>
            )}

            {item.allergens?.length > 0 && (
              <View style={styles.allergensSection}>
                <Text style={styles.sectionTitle}>Alerjenler</Text>
                <View style={styles.allergenTags}>
                  {item.allergens?.map((allergen, index) => (
                    <View key={index} style={styles.allergenTag}>
                      <Ionicons name="alert-circle" size={16} color={theme.colors.warning} />
                      <Text style={styles.allergenText}>{allergen}</Text>
                    </View>
                  ))}
                </View>
              </View>
            )}

            {item.reviews?.length > 0 && renderReviews()}
          </View>
        )}
      </View>
    </Animated.View>
  );
};




const styles = StyleSheet.create({
    menuItemCard: {
        width: CARD_WIDTH,
        backgroundColor: theme.colors.card,
        borderRadius: 24,
        marginBottom: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.15,
        shadowRadius: 12,
        elevation: 8,
        overflow: 'hidden',
        alignSelf: 'center',
      },
      itemImageContainer: {
        width: '100%',
        height: 200,
      },
      itemImage: {
        width: '100%',
        height: '100%',
      },

  favoriteButton: {
    position: 'absolute',
    top: 16,
    right: 16,
    backgroundColor: 'rgba(0,0,0,0.5)',
    padding: 10,
    borderRadius: 50,
    backdropFilter: 'blur(10px)',
  },
  badgeContainer: {
    position: 'absolute',
    top: 16,
    left: 16,
    flexDirection: 'row',
    gap: 8,
  },
  badge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
  },
  newBadge: {
    backgroundColor: theme.colors.accent,
  },
  popularBadge: {
    backgroundColor: theme.colors.success,
  },
  badgeText: {
    color: theme.colors.white,
    fontSize: 12,
    fontWeight: '600',
  },
  itemContent: {
    padding: 20,
  },
  titleContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  itemName: {
    fontSize: 22,
    fontWeight: '700',
    color: theme.colors.text.primary,
    flex: 1,
  },
  itemPrice: {
    fontSize: 22,
    fontWeight: '700',
    color: theme.colors.accent,
    marginLeft: 16,
  },
  itemDescription: {
    fontSize: 14,
    color: theme.colors.text.secondary,
    lineHeight: 20,
    marginBottom: 16,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: theme.colors.secondary,
    padding: 12,
    borderRadius: 16,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  reviewsScroll: {
    maxHeight: 200,
  },

  statText: {
    color: theme.colors.text.secondary,
    fontSize: 14,
  },
  expandedContent: {
    marginTop: 20,
    gap: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: theme.colors.text.primary,
    marginBottom: 16,
  },
  ingredientsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  ingredientItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: theme.colors.secondary,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
  },
  ingredientText: {
    color: theme.colors.text.primary,
    fontSize: 14,
  },
  allergenTags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  allergenTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(255, 193, 7, 0.1)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
  },
  allergenText: {
    color: theme.colors.warning,
    fontSize: 14,
    fontWeight: '500',
  },
  reviewsSection: {
    marginTop: 24,
    backgroundColor: theme.colors.reviewBg,
    borderRadius: 16,
    padding: 16,
  },
  reviewsHeader: {
    marginBottom: 16,
  },
  overallRating: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    gap: 8,
  },
  ratingText: {
    fontSize: 24,
    fontWeight: '700',
    color: theme.colors.rating,
  },
  totalReviews: {
    color: theme.colors.text.secondary,
    fontSize: 14,
  },
  reviewsList: {
    gap: 16,
  },
  reviewItem: {
    backgroundColor: theme.colors.card,
    borderRadius: 12,
    padding: 16,
    gap: 12,
  },
  reviewHeader: {
    marginBottom: 8,
  },
  reviewUserInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  userAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: theme.colors.accent,
    justifyContent: 'center',
    alignItems: 'center',
  },
  userInitial: {
    color: theme.colors.white,
    fontSize: 18,
    fontWeight: '600',
  },
  userDetails: {
    gap: 4,
  },
  reviewUserName: {
    color: theme.colors.text.primary,
    fontSize: 16,
    fontWeight: '600',
  },
  ratingContainer: {
    flexDirection: 'row',
    gap: 2,
  },
  starIcon: {
    marginRight: 2,
  },
  reviewText: {
    color: theme.colors.text.secondary,
    fontSize: 14,
    lineHeight: 20,
  },

});

export default MenuItem;