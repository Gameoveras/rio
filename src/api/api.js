import axios from "axios";

const Base_url = "https://asebay.com.tr/moods/";

class AppService { 


    static async kodgonder(email) {


        if (!email) {
            return { hata: "Lütfen email adresinizi giriniz." };
        }

        try {
            const response = await axios.post(`${Base_url}kod-gonder.php`, {
                email
            }, {
                headers: {
                    "Content-Type": "application/json"
                }
            });


            return response.data;
        }


        catch (error) {
            console.error("Axios Hatası:", error);
            return { hata: "Bir hatsa oluştu. Lütfen tekrar deneyin." };
        }
    }

    static async kodgonder2(email) {
        if (!email) {
            return { hata: "Lütfen email adresinizi giriniz." };
        }

        try {
            const response = await axios.post(`${Base_url}kod-gonder2.php`, {
                email
            }, {
                headers: {
                    "Content-Type": "application/json"
                }
            });

            return response.data;
        }
        catch (error) {
            return { hata: "Bir hata oluştu. Lütfen tekrar deneyin." };
        }
    }

    static async kayitOl(ad, soyad, email, sifre) {
        // Alanları kontrol et
        if (!ad || !soyad || !email || !sifre) {
          return { hata: "Lütfen tüm alanları doldurunuz." };
        }
    
        // Şifre uzunluğunu kontrol et
        if (sifre.length < 6) {
          return { hata: "Şifre en az 6 karakter olmalıdır." };
        }
    
        try {
          // POST isteğini PHP'ye gönder
          const response = await axios.post(`${Base_url}kaydol.php`, {
            ad,
            soyad,
            email,
            sifre
          }, {
            headers: {
              "Content-Type": "application/json"
            }
          });
    
          // Yanıtı kontrol et
          if (response.data.success) {
            return {
              success: true,
              message: response.data.message,
              userId: response.data.userId,
              ad_soyad: response.data.ad_soyad,
              eposta: response.data.eposta,
              yildiz_sayisi: response.data.yildiz_sayisi,
              yorum_sayisi: response.data.yorum_sayisi,
              qr_code: `data:image/png;base64,${response.data.qr_code}` // Base64 QR kodu
            };
          } else {
            return { hata: response.data.error || "Bir hata oluştu. Lütfen tekrar deneyin." };
          }
        } catch (error) {
          return { hata: "Bağlantı hatası! Lütfen internet bağlantınızı kontrol edin." };
        }
    }
    

    static async girisYap(email, sifre) {
        if (!email || !sifre) {
            return { hata: "Lütfen tüm alanları doldurunuz." };
        }

    
        try {
            const response = await axios.post(`${Base_url}giris.php`, JSON.stringify({
                eposta: email,
                parola: sifre
            }, {
                headers: {
                    "Content-Type": "application/json"
                }
            })
            );
    
            if (response.data && response.data.success === true) {
                return {
                    success: true,
                    message: response.data.message,
                    userId: response.data.userId,
                    ad_soyad: response.data.ad_soyad,
                    eposta: response.data.eposta,
                    telefon_no: response.data.telefon_no,
                    yildiz_sayisi: response.data.yildiz_sayisi,
                    yorum_sayisi: response.data.yorum_sayisi,
                    qr_code: `data:image/png;base64,${response.data.qr_code}` // Base64 QR kodu
                };
            } else {
                return { hata: response.data.error || "Giriş başarısız, tekrar deneyin." };
            }
        } catch (error) {
            console.error("Axios Hatası:", error);
            return { hata: "Bağlantı hatası! Lütfen internet bağlantınızı kontrol edin." };
        }
    }

    static async editProfile(userId, email, phone) {
        if (!userId || !email || !phone) {
            return { hata: "Lütfen tüm alanları doldurunuz." };
        }
    
        try {
            const response = await axios.post(`${Base_url}profil-duzenle.php`, {
                userId,
                email,
                phone
            }, {
                headers: {
                    "Content-Type": "application/json"
                }
            });
    
            if (response.data.success) {
                return {
                    success: true,
                    message: response.data.message,
                    ad_soyad: response.data.ad_soyad,
                    eposta: response.data.eposta,
                    telefon_no: response.data.telefon_no
                };
            } else {
                return { hata: response.data.error || "Bir hata oluştu. Lütfen tekrar deneyin." };
            }
        } catch (error) {
            return { hata: "Bağlantı hatası! Lütfen internet bağlantınızı kontrol edin." };
        }
    }

    static async deleteAccount(userId) {
        if (!userId) {
            return { hata: "Kullanıcı kimliği eksik." };
        }
    
        try {
            const response = await axios.post(`${Base_url}hesap-sil.php`, {
                userId
            }, {
                headers: {
                    "Content-Type": "application/json"
                }
            });
    
            if (response.data.success) {
                return { success: true, message: response.data.message };
            } else {
                return { hata: response.data.error || "Bir hata oluştu. Lütfen tekrar deneyin." };
            }
        } catch (error) {
            return { hata: "Bağlantı hatası! Lütfen internet bağlantınızı kontrol edin." };
        }
    }

    static async sifresifirla(userId, newPassword) {
        if (!userId ||  !newPassword) {
            return { hata: "Lütfen tüm alanları doldurunuz." };
        }
    
        try {
            const response = await axios.post(`${Base_url}sifre_sifirla.php`, {
                userId,
                newPassword
            }, {
                headers: {
                    "Content-Type": "application/json"
                }
            });
    
            if (response.data.success) {
                return { success: true, message: response.data.message };
            } else {
                return { hata: response.data.error || "Bir hata oluştu. Lütfen tekrar deneyin." };
            }
        } catch (error) {
            return { hata: "Bağlantı hatası! Lütfen internet bağlantınızı kontrol edin." };
        }
    }
       



    // Ürünler
    static async getmenu() {
        try {
            const response = await axios.get(`${Base_url}menu.php`);
            return response.data;
        } catch (error) {
            console.error("Bağlantı hatası:", error);   
            return { hata: "Bağlantı hatası! Lütfen internet bağlantınızı kontrol edin." };
        }
    }

    static async getmenuonecikan() {
        try {
            const response = await axios.get(`${Base_url}one_cikan_urunler.php`);
            return response.data;
        } catch (error) {
            console.error("Bağlantı hatası:", error);   
            return { hata: "Bağlantı hatası! Lütfen internet bağlantınızı kontrol edin." };
        }
    }

    static async getkampanya() {
        try {
            const response = await axios.get(`${Base_url}kampanya.php`);
            return response.data;
        } catch (error) {
            console.error("Bağlantı hatası:", error);   
            return { hata: "Bağlantı hatası! Lütfen internet bağlantınızı kontrol edin." };
        }
    }

   static async encokyorumlanan() {
        try {
            const response = await axios.get(`${Base_url}en_cok_yorumlanan.php`);
            return response.data;
        } catch (error) {
            console.error("Bağlantı hatası:", error);   
            return { hata: "Bağlantı hatası! Lütfen internet bağlantınızı kontrol edin." };
        }
    }



    // Favoriye ekle
    static async addFavorite(userId, productId) {
    
        try {
            const response = await axios.post(
                `${Base_url}favori-ekle.php`, // API endpointini güncelleyin
                { userId, productId },
                { 
                    headers: { 
                        "Content-Type": "application/json",
                        "Accept": "application/json"
                    },
                    timeout: 5000 
                }
            );
    
            if (!response.data?.success) {
                throw new Error(response.data?.error || "Sunucu hatası");
            }
    
            // Yeni yanıt formatı
            return {
                success: true,
                action: response.data.action, // 'added' veya 'removed'
                isFavori: response.data.is_favori,
                product: response.data.product,
                message: response.data.message || `Ürün başarıyla ${response.data.action === 'added' ? 'favorilere eklendi' : 'favorilerden kaldırıldı'}`
            };
    
        } catch (error) {
            console.error("API Hatası:", error);
            
            // Detaylı hata mesajı
            const errorMessage = error.response?.data?.error 
                || error.message 
                || (error.code === 'ECONNABORTED' ? "Zaman aşımı! Lütfen tekrar deneyin" : "Beklenmeyen hata");
    
            return {
                success: false,
                error: errorMessage,
                isFavori: error.response?.data?.is_favori ?? null,
                productId // Hata durumunda hangi ürünle ilgili olduğunu belirtmek için
            };
        }
    }

    // Favoriden kaldır
    static async removeFavorite(userId, productId) {
    
        try {
            const response = await axios.post(
                `${Base_url}favori-kaldir.php`, // API endpointini güncelleyin
                { userId, productId },
                { 
                    headers: { 
                        "Content-Type": "application/json",
                        "Accept": "application/json"
                    },
                    timeout: 5000 
                }
            );
    
            if (!response.data?.success) {
                throw new Error(response.data?.error || "Sunucu hatası");
            }
    
            // Yeni yanıt formatı
            return {
                success: true,
                action: response.data.action, // 'added' veya 'removed'
                isFavori: response.data.is_favori,
                product: response.data.product,
                message: response.data.message || `Ürün başarıyla ${response.data.action === 'added' ? 'favorilere eklendi' : 'favorilerden kaldırıldı'}`
            };
    
        } catch (error) {
            console.error("API Hatası:", error);
            
            // Detaylı hata mesajı
            const errorMessage = error.response?.data?.error 
                || error.message 
                || (error.code === 'ECONNABORTED' ? "Zaman aşımı! Lütfen tekrar deneyin" : "Beklenmeyen hata");
    
            return {
                success: false,
                error: errorMessage,
                isFavori: error.response?.data?.is_favori ?? null,
                productId // Hata durumunda hangi ürünle ilgili olduğunu belirtmek için
            };
        }
    }

    // Yorum ekle
    static async addComment(userId, productId, comment, rating) {
    
        try {
            const response = await axios.post(
                `${Base_url}yorum-ekle.php`, // API endpointini güncelleyin
                { userId, productId, comment, rating },
                { 
                    headers: { 
                        "Content-Type": "application/json",
                        "Accept": "application/json"
                    },
                    timeout: 5000 
                }
            );
    
            if (!response.data?.success) {
                throw new Error(response.data?.error || "Sunucu hatası");
            }
    
            // Yeni yanıt formatı
            return {
                success: true,
                message: response.data.message || "Yorum başarıyla eklendi",
                comment: response.data.comment
            };
    
        } catch (error) {
            console.error("API Hatası:", error);
            
            // Detaylı hata mesajı
            const errorMessage = error.response?.data?.error 
                || error.message 
                || (error.code === 'ECONNABORTED' ? "Zaman aşımı! Lütfen tekrar deneyin" : "Beklenmeyen hata");
    
            return {
                success: false,
                error: errorMessage,
                productId // Hata durumunda hangi ürünle ilgili olduğunu belirtmek için
            };
        }
    }


    // Favorileri getir
    static async getFavorites(userId) {
    
        try {
            const response = await axios.post(
                `${Base_url}favoriler.php`, // API endpointini güncelleyin
                { userId },
                { 
                    headers: { 
                        "Content-Type": "application/json",
                        "Accept": "application/json"
                    },
                    timeout: 5000 
                }
            );
    
            if (!response.data?.success) {
                throw new Error(response.data?.error || "Sunucu hatası");
            }
    
            // Yeni yanıt formatı
            return {
                success: true,
                favorites: response.data.favorites
            };
    
        } catch (error) {
            console.error("API Hatası:", error);
            
            // Detaylı hata mesajı
            const errorMessage = error.response?.data?.error 
                || error.message 
                || (error.code === 'ECONNABORTED' ? "Zaman aşımı! Lütfen tekrar deneyin" : "Beklenmeyen hata");
    
            return {
                success: false,
                error: errorMessage
            };
        }
    }


    // Kuponları getir
    static async getCoupons(userId) {
    
        try {
            const response = await axios.post(
                `${Base_url}kuponlar.php`, // API endpointini güncelleyin
                { userId },
                { 
                    headers: { 
                        "Content-Type": "application/json",
                        "Accept": "application/json"
                    },
                    timeout: 5000 
                }
            );
    
            if (!response.data?.success) {
                throw new Error(response.data?.error || "Sunucu hatası");
            }
    
            // Yeni yanıt formatı
            return {
                success: true,
                coupons: response.data.coupons
            };
    
        } catch (error) {
            console.error("API Hatası:", error);
            
            // Detaylı hata mesajı
            const errorMessage = error.response?.data?.error 
                || error.message 
                || (error.code === 'ECONNABORTED' ? "Zaman aşımı! Lütfen tekrar deneyin" : "Beklenmeyen hata");
    
            return {
                success: false,
                error: errorMessage
            };
        }
    }

    // Kupon kullan
    static async useCoupon(userId, couponId) {
    
        try {
            const response = await axios.post(
                `${Base_url}kupon-kullan.php`, // API endpointini güncelleyin
                { userId, couponId },
                { 
                    headers: { 
                        "Content-Type": "application/json",
                        "Accept": "application/json"
                    },
                    timeout: 5000 
                }
            );
    
            if (!response.data?.success) {
                throw new Error(response.data?.error || "Sunucu hatası");
            }
    
            // Yeni yanıt formatı
            return {
                success: true,
                message: response.data.message
            };
    
        } catch (error) {
            console.error("API Hatası:", error);
            
            // Detaylı hata mesajı
            const errorMessage = error.response?.data?.error 
                || error.message 
                || (error.code === 'ECONNABORTED' ? "Zaman aşımı! Lütfen tekrar deneyin" : "Beklenmeyen hata");
    
            return {
                success: false,
                error: errorMessage
            };
        }
    }

    // Kullanıcı getir
    static async getUser(userId) {
    
        try {
            const response = await axios.post(
                `${Base_url}kullanici.php`, // API endpointini güncelleyin
                { userId },
                { 
                    headers: { 
                        "Content-Type": "application/json",
                        "Accept": "application/json"
                    },
                    timeout: 5000 
                }
            );
    
            if (!response.data?.success) {
                throw new Error(response.data?.error || "Sunucu hatası");
            }
    
            // Yeni yanıt formatı
            return {
                success: true,
                user: response.data.user
            };
    
        } catch (error) {
            console.error("API Hatası:", error);
            
            // Detaylı hata mesajı
            const errorMessage = error.response?.data?.error 
                || error.message 
                || (error.code === 'ECONNABORTED' ? "Zaman aşımı! Lütfen tekrar deneyin" : "Beklenmeyen hata");
    
            return {
                success: false,
                error: errorMessage
            };
        }
    }

    // hesap hareketleri getir
    static async getAccountMovements(userId) {
    
        try {
            const response = await axios.post(
                `${Base_url}hesap-hareketleri.php`, // API endpointini güncelleyin
                { userId },
                { 
                    headers: { 
                        "Content-Type": "application/json",
                        "Accept": "application/json"
                    },
                    timeout: 5000 
                }
            );
    
            if (!response.data?.success) {
                throw new Error(response.data?.error || "Sunucu hatası");
            }
    
            // Yeni yanıt formatı
            return {
                success: true,
                movements: response.data.movements
            };
    
        } catch (error) {
            console.error("API Hatası:", error);
            
            // Detaylı hata mesajı
            const errorMessage = error.response?.data?.error 
                || error.message 
                || (error.code === 'ECONNABORTED' ? "Zaman aşımı! Lütfen tekrar deneyin" : "Beklenmeyen hata");
    
            return {
                success: false,
                error: errorMessage
            };
        }
    }






}

export default AppService;