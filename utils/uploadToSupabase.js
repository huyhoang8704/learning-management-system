const supabase = require('../config/supabase');
const { v4: uuidv4 } = require('uuid');
const path = require('path');
const fs = require('fs');

/**
 * Upload file lên Supabase Storage
 * @param {string} bucket - tên bucket
 * @param {object} file - object file từ multer
 * @returns {string} publicURL - link public của file sau khi upload
 */
async function uploadToSupabase(bucket, file) {
  const fileExt = path.extname(file.originalname);
  const fileName = `${uuidv4()}${fileExt}`;

  const { data, error } = await supabase.storage
    .from(bucket)
    .upload(fileName, fs.createReadStream(file.path), {
      cacheControl: '3600',
      upsert: false,
      contentType: file.mimetype,
    });

  if (error) throw error;

  // Lấy public URL
  const { data: publicData } = supabase.storage.from(bucket).getPublicUrl(fileName);
  return publicData.publicUrl;
}

module.exports = uploadToSupabase;
