package utils

import (
	"crypto/aes"
	"crypto/cipher"
	"crypto/rand"
	"encoding/base64"
	"errors"
	"fmt"
	"io"
	"os"
)

func EncryptValue(text string) (string, error) {
	EncryptionKey, hasValue := os.LookupEnv("ENCRYPTION_KEY")
	if !hasValue {
		return "", fmt.Errorf("env ENCRYPTION_KEY not defined")
	}

  byteKey, err := base64.StdEncoding.DecodeString(EncryptionKey)
	if err != nil {
		return "", err
	}

	byteText := []byte(text)

	block, err := aes.NewCipher(byteKey)
	if err != nil {
		return "", err
	}

	nonce := make([]byte, 12) // Nonce size for GCM is always 12 bytes
	if _, err := io.ReadFull(rand.Reader, nonce); err != nil {
		return "", err
	}

	aesgcm, err := cipher.NewGCM(block)
	if err != nil {
		return "", err
	}

	ciphertext := aesgcm.Seal(nil, nonce, byteText, nil)
	combinedMessage := append(nonce, ciphertext...)

	return base64.StdEncoding.EncodeToString(combinedMessage), nil
}

func DecryptValue(encryptedString string) (string, error) {
	EncryptionKey, hasValue := os.LookupEnv("ENCRYPTION_KEY")
	if !hasValue {
		return "", fmt.Errorf("env ENCRYPTION_KEY not defined")
	}

  byteKey, err := base64.StdEncoding.DecodeString(EncryptionKey)
	if err != nil {
		return "", err
	}

	combinedMessage, err := base64.StdEncoding.DecodeString(encryptedString)
	if err != nil {
		return "", err
	}

	block, err := aes.NewCipher(byteKey)
	if err != nil {
		return "", err
	}

	if len(combinedMessage) < 12+aes.BlockSize {
		return "", errors.New("ciphertext too short")
	}

	nonce := combinedMessage[:12]
	ciphertext := combinedMessage[12:]

	aesgcm, err := cipher.NewGCM(block)
	if err != nil {
		return "", err
	}

	plaintext, err := aesgcm.Open(nil, nonce, ciphertext, nil)
	if err != nil {
		return "", err
	}

	return string(plaintext), nil
}
