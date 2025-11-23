import React, { useState } from 'react'
import { Alert, StyleSheet, View, TextInput, TouchableOpacity, Text } from 'react-native'
import { supabase } from '../lib/supabase'

export default function Auth() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)

  async function signInWithEmail() {
    setLoading(true)
    const { error } = await supabase.auth.signInWithPassword({
      email: email,
      password: password,
    })
    if (error) Alert.alert('Error', error.message)
    setLoading(false)
  }

  async function signUpWithEmail() {
    setLoading(true)
    try {
      // First, create auth user in Supabase
      const {
        data: { session, user },
        error: authError,
      } = await supabase.auth.signUp({
        email: email,
        password: password,
      })
      
      if (authError) {
        Alert.alert('Error', authError.message)
        setLoading(false)
        return
      }

      if (user) {
        // Then, create user profile in your backend
        try {
          console.log('Creating user profile with:', { id: user.id, email: user.email })
          
          const response = await fetch('https://jams-journal-backend.up.railway.app/users', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              id: user.id,
              email: user.email,
            }),
          })

          console.log('Response status:', response.status)
          console.log('Response headers:', response.headers.get('content-type'))

          // Check if response is JSON before parsing
          const contentType = response.headers.get('content-type')
          if (contentType && contentType.includes('application/json')) {
            const responseData = await response.json()
            console.log('Backend response:', responseData)

            if (!response.ok) {
              console.error('Failed to create user profile:', responseData)
              Alert.alert('Warning', 'Account created but profile setup incomplete')
            } else {
              console.log('User profile created successfully!')
            }
          } else {
            // Backend returned non-JSON (probably HTML error page)
            const textResponse = await response.text()
            console.error('Backend returned non-JSON response:', textResponse.substring(0, 200))
            Alert.alert('Warning', 'Account created but profile setup incomplete. Backend endpoint may be incorrect.')
          }
        } catch (backendError) {
          console.error('Backend user creation error:', backendError)
          Alert.alert('Warning', 'Account created but profile setup incomplete')
        }

        if (!session) {
          Alert.alert('Success', 'Please check your inbox for email verification!')
        }
      }
    } catch (error) {
      Alert.alert('Error', 'Something went wrong during signup')
      console.error('Signup error:', error)
    }
    setLoading(false)
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Welcome to JAMS</Text>
        <Text style={styles.subtitle}>Journal of Adventist Mission Studies</Text>
      </View>

      <View style={styles.form}>
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Email</Text>
          <TextInput
            style={styles.input}
            onChangeText={(text) => setEmail(text)}
            value={email}
            placeholder="email@address.com"
            autoCapitalize={'none'}
            keyboardType="email-address"
          />
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Password</Text>
          <TextInput
            style={styles.input}
            onChangeText={(text) => setPassword(text)}
            value={password}
            secureTextEntry={true}
            placeholder="Password"
            autoCapitalize={'none'}
          />
        </View>

        <TouchableOpacity 
          style={[styles.button, loading && styles.buttonDisabled]} 
          disabled={loading} 
          onPress={() => signInWithEmail()}
        >
          <Text style={styles.buttonText}>Sign In</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.button, styles.buttonOutline, loading && styles.buttonDisabled]} 
          disabled={loading} 
          onPress={() => signUpWithEmail()}
        >
          <Text style={styles.buttonTextOutline}>Sign Up</Text>
        </TouchableOpacity>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    justifyContent: 'center',
    padding: 20,
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  title: {
    fontFamily: 'sans_bold',
    fontSize: 28,
    color: '#357db5',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontFamily: 'sans_regular',
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
  form: {
    width: '100%',
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontFamily: 'sans_semibold',
    fontSize: 14,
    color: '#333',
    marginBottom: 8,
  },
  input: {
    fontFamily: 'sans_regular',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#f9f9f9',
  },
  button: {
    backgroundColor: '#357db5',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
  },
  buttonOutline: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: '#357db5',
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  buttonText: {
    fontFamily: 'sans_semibold',
    color: '#fff',
    fontSize: 16,
  },
  buttonTextOutline: {
    fontFamily: 'sans_semibold',
    color: '#357db5',
    fontSize: 16,
  },
})

