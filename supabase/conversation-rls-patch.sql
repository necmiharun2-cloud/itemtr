-- Supabase: ilan üzerinden sohbet oluşturma ve son mesaj güncelleme için gerekli politikalar.
-- Bu dosyayı Supabase SQL Editor'de çalıştırın.

DROP POLICY IF EXISTS "Users can create conversations as participant" ON conversations;
DROP POLICY IF EXISTS "Participants can update own conversations" ON conversations;

-- Konuşma oluşturma: kullanıcı kendisini katılımcı olarak ekleyebilir
CREATE POLICY "Users can create conversations as participant"
  ON conversations FOR INSERT
  WITH CHECK (auth.uid() = participant_1 OR auth.uid() = participant_2);

-- Son mesaj / zaman damgası güncelleme (mesaj gönderirken)
CREATE POLICY "Participants can update own conversations"
  ON conversations FOR UPDATE
  USING (auth.uid() = participant_1 OR auth.uid() = participant_2);
