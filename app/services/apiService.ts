// services/apiService.ts

import axios from 'axios';
//import { API_URL } from 'react-native-dotenv';
import messaging from '@react-native-firebase/messaging'; // Ensure you have this import

const API_BASE_URL = 'https://indheart.pinesphere.in/api/api';

// Use environment variable for API base URL
//const API_BASE_URL = process.env.API_URL || 'http://localhost:8000/api/api';  // Fallback for local dev

//const API_BASE_URL = API_URL || 'http://localhost:8000/api/api';


// Function to create a new patient
export const createPatient = async (patientData: {
    name: string;
    age: string;
    gender: string | null;
    education: string | null;
    occupation: string | null;
    marital_status: string | null;
    diet: string | null;
    smoking: boolean;
    alcoholic: boolean;
    patient_contact_number: string | null;
    emergency_doctor_number: string | null;
}) => {
    try {
        const response = await axios.post(`${API_BASE_URL}/patients/`, patientData);
        return response.data;
    } catch (error: any) {
        if (error.response) {
            const errorDetails = error.response.data;
            let errorMessage = 'An error occurred';
            
            if (errorDetails) {
                errorMessage = Object.keys(errorDetails)
                    .map(key => `${key}: ${errorDetails[key].join(', ')}`)
                    .join('; ');
            }
            
            throw new Error(` ${errorMessage}`);
        } else if (error.request) {
            throw new Error('ERROR: No response received from the server');
        } else {
            throw new Error(` ${error.message}`);
        }
    }
};

// Function to create or update clinical data
export const createClinical = async (clinicalData: {
    cad_duration?: string;
    stents_placed?: string;
    ejection_fraction?: number | null;
    vessels_involved?: string;
    comorbidities?: string;
    duration_of_comorbidities?: string;
    next_follow_up_date?: string | null;
    date_of_operation?: string | null;
}) => {
    try {
        const response = await axios.post(`${API_BASE_URL}/clinical-data/`, clinicalData);
        console.log("API Response:", response.data); // Log response data

        return response.data;
    } catch (error: any) {
        if (error.response) {
            const errorDetails = error.response.data;
            let errorMessage = 'An error occurred';
            
            if (errorDetails) {
                errorMessage = Object.keys(errorDetails)
                    .map(key => `${key}: ${errorDetails[key].join(', ')}`)
                    .join('; ');
            }
            
            throw new Error(` ${errorMessage}`);
        } else if (error.request) {
            throw new Error('ERROR: No response received from the server');
        } else {
            throw new Error(` ${error.message}`);
        }
    }
};



export const saveOrUpdateMetabolic = async (metabolicData: {
    patient_id: string;
    height?: number;
    weight?: number;
    bmi?: number;
    waist_circumference?: number;
    hip_circumference?: number;
    sbp?: number;
    dbp?: number;
    fbs?: number;
    ldl?: number;
    hdl?: number;
    triglycerides?: number;
    total_cholesterol?: number;
    meters_walked?: number;
}) => {
    try {
        // Check if data exists
        const response = await axios.get(`${API_BASE_URL}/metabolic-data/?patient_id=${metabolicData.patient_id}`);
        const data = response.data;

        console.log('Data retrieved for patient ID:', metabolicData.patient_id);
        console.log('Response data:', data);

        if (data.length > 0) {
            // Assuming that the patient_id is unique, we use it to identify the record
            const existingRecord = data[0]; // Take the first record
            const existingId = existingRecord.id; // Ensure the ID is present
            console.log('Existing ID:', existingId);

            if (existingId) {
                // Update the existing record
                const updateResponse = await axios.put(`${API_BASE_URL}/metabolic-data/${existingId}/`, metabolicData);
                console.log('Updated Data:', updateResponse.data);
                return updateResponse.data;
            } else {
                throw new Error('Record ID is missing in the response data.');
            }
        } else {
            // Create a new record
            const createResponse = await axios.post(`${API_BASE_URL}/metabolic-data/`, metabolicData);
            console.log('Created Data:', createResponse.data);
            return createResponse.data;
        }
    } catch (error: unknown) {
        if (axios.isAxiosError(error)) {
            // Handle axios-specific errors
            console.error('Axios Error Details:', error.response?.data || error.message);
            throw new Error(error.response?.data?.detail || error.message || 'An error occurred');
        } else if (error instanceof Error) {
            // Handle other types of errors
            console.error('Error Details:', error.message);
            throw new Error(error.message || 'An error occurred');
        } else {
            // Fallback for unknown error types
            console.error('Unknown Error:', error);
            throw new Error('An unknown error occurred');
        }
    }
};
