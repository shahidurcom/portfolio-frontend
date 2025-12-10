// ============================================
// NAVBAR FUNCTIONALITY
// ============================================

// Navbar scroll effect
window.addEventListener('scroll', function() {
    const navbar = document.getElementById('navbar');
    if (window.scrollY > 50) {
        navbar.classList.add('scrolled');
    } else {
        navbar.classList.remove('scrolled');
    }
});

// Mobile menu toggle
const navToggle = document.getElementById('navToggle');
const navMenu = document.getElementById('navMenu');

if (navToggle) {
    navToggle.addEventListener('click', function() {
        navToggle.classList.toggle('active');
        navMenu.classList.toggle('active');
        
        // Update aria-expanded
        const isExpanded = navMenu.classList.contains('active');
        navToggle.setAttribute('aria-expanded', isExpanded);
    });
}

// Close mobile menu when clicking on a link
document.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', function() {
        navToggle.classList.remove('active');
        navMenu.classList.remove('active');
        navToggle.setAttribute('aria-expanded', 'false');
    });
});

// Active nav link on scroll
const sections = document.querySelectorAll('section, [id]');
const navLinks = document.querySelectorAll('.nav-link');

window.addEventListener('scroll', () => {
    let current = '';
    sections.forEach(section => {
        const sectionTop = section.offsetTop;
        const sectionHeight = section.clientHeight;
        if (scrollY >= (sectionTop - 200)) {
            current = section.getAttribute('id');
        }
    });

    navLinks.forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('href') === `#${current}`) {
            link.classList.add('active');
        }
    });
});

// ============================================
// FORM STEP NAVIGATION
// ============================================

function nextStep(currentStep) {
    // Validate current step before proceeding
    const currentForm = document.getElementById(`step${currentStep}`);
    const inputs = currentForm.querySelectorAll('input[required], select[required], textarea[required]');
    let isValid = true;

    inputs.forEach(input => {
        if (!input.value.trim()) {
            isValid = false;
            input.style.borderColor = 'var(--error)';
        } else {
            input.style.borderColor = '';
        }
    });

    if (!isValid) {
        alert('Please fill in all required fields before proceeding.');
        return;
    }

    document.getElementById(`step${currentStep}`).style.display = 'none';
    document.getElementById(`step${currentStep + 1}`).style.display = 'block';
    
    // Update progress steps
    const progressSteps = document.querySelectorAll('.progress-step');
    progressSteps[currentStep - 1].classList.remove('active');
    progressSteps[currentStep - 1].classList.add('completed');
    progressSteps[currentStep].classList.add('active');

    // Scroll to top of form
    document.getElementById('project-form').scrollIntoView({ behavior: 'smooth' });
}

function prevStep(currentStep) {
    document.getElementById(`step${currentStep}`).style.display = 'none';
    document.getElementById(`step${currentStep - 1}`).style.display = 'block';
    
    // Update progress steps
    const progressSteps = document.querySelectorAll('.progress-step');
    progressSteps[currentStep - 1].classList.remove('active');
    progressSteps[currentStep - 2].classList.add('active');
    progressSteps[currentStep - 2].classList.remove('completed');

    // Scroll to top of form
    document.getElementById('project-form').scrollIntoView({ behavior: 'smooth' });
}

// ============================================
// FORM SUBMISSION WITH GOOGLE APPS SCRIPT
// ============================================

// ============================================
// FORM SUBMISSION WITH NODE.JS BACKEND
// ============================================

// Determine API URL based on environment
// const API_URL = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
//     ? 'http://localhost:3000/api/send-project-request' // Local Development (assuming backend on 3000)
//     : '/api/send-project-request'; // Production (Vercel)

const API_URL = 'https://portfolio-backend-ten-phi.vercel.app/api/send-project-request'; // Production (Vercel)

document.getElementById('projectForm').addEventListener('submit', async function(e) {
    e.preventDefault();
    
    const submitBtn = document.getElementById('submitBtn');
    const btnText = submitBtn.querySelector('.btn-text');
    const btnLoader = submitBtn.querySelector('.btn-loader');
    const btnIcon = submitBtn.querySelector('.btn-icon');
    
    // Show loading state
    submitBtn.classList.add('loading');
    submitBtn.disabled = true;
    btnText.style.display = 'none';
    btnIcon.style.display = 'none';
    btnLoader.style.display = 'inline-flex';
    
    try {
        // Create FormData object for multipart/form-data submission
        const formData = new FormData();
        
        // Append simple fields
        formData.append('projectName', document.getElementById('projectName').value);
        formData.append('projectType', document.getElementById('projectType').value);
        formData.append('projectDescription', document.getElementById('projectDescription').value);
        formData.append('timeline', document.getElementById('timeline').value);
        formData.append('budget', document.querySelector('input[name="budget"]:checked').value);
        
        // Client Info
        formData.append('clientName', document.getElementById('fullName').value);
        formData.append('clientEmail', document.getElementById('email').value);
        formData.append('clientPhone', document.getElementById('phone').value || 'Not provided');
        formData.append('clientCompany', document.getElementById('company').value || '');
        formData.append('additionalInfo', document.getElementById('additionalInfo').value || 'None');
        formData.append('timestamp', new Date().toLocaleString());

        // Append files
        const files = fileInput.files;
        for (let i = 0; i < files.length; i++) {
            formData.append('referenceFiles', files[i]);
        }

        // Send to Node.js Backend
        const response = await fetch(API_URL, {
            method: 'POST',
            // headers: { 'Content-Type': 'multipart/form-data' }, // Do NOT set Content-Type manually with FormData!
            body: formData
        });

        const result = await response.json();

        if (response.ok && result.success) {
            console.log('Success:', result);
            if(result.previewUrl) {
                console.log('Email Preview:', result.previewUrl);
                // Optional: Open preview for demo purposes, or just log it.
            }
            showSuccess();
        } else {
            throw new Error(result.message || 'Submission failed');
        }
        
    } catch (error) {
        console.error('Error submitting form:', error);
        showError('There was an error submitting your request. Please try again or contact me directly at support@shahidur.com');
    } finally {
        // Reset button state
        submitBtn.classList.remove('loading');
        submitBtn.disabled = false;
        btnText.style.display = 'inline';
        btnIcon.style.display = 'inline';
        btnLoader.style.display = 'none';
    }
});

function showSuccess() {
    document.querySelectorAll('.form-section').forEach(section => {
        section.style.display = 'none';
    });
    
    document.getElementById('successMessage').style.display = 'block';
    
    // Update all progress steps to completed
    document.querySelectorAll('.progress-step').forEach(step => {
        step.classList.remove('active');
        step.classList.add('completed');
    });

    // Scroll to success message
    document.getElementById('project-form').scrollIntoView({ behavior: 'smooth' });
}

function showError(message) {
    document.querySelectorAll('.form-section').forEach(section => {
        section.style.display = 'none';
    });
    
    const errorMessage = document.getElementById('errorMessage');
    document.getElementById('errorText').textContent = message;
    errorMessage.style.display = 'block';

    // Scroll to error message
    document.getElementById('project-form').scrollIntoView({ behavior: 'smooth' });
}

function hideError() {
    document.getElementById('errorMessage').style.display = 'none';
    document.getElementById('step3').style.display = 'block';
}

// Reset form
function resetForm() {
    document.getElementById('successMessage').style.display = 'none';
    document.getElementById('step1').style.display = 'block';
    document.getElementById('projectForm').reset();
    
    // Reset progress steps
    document.querySelectorAll('.progress-step').forEach((step, index) => {
        step.classList.remove('active', 'completed');
        if (index === 0) {
            step.classList.add('active');
        }
    });
    
    // Reset file upload area
    const fileUploadArea = document.getElementById('fileUploadArea');
    fileUploadArea.querySelector('.file-upload-text').textContent = 'Upload files';
    fileUploadArea.classList.remove('drag-over');
    fileUploadArea.style.borderColor = '';
    fileUploadArea.style.background = '';

    // Scroll to form
    document.getElementById('project-form').scrollIntoView({ behavior: 'smooth' });
}

// ============================================
// FILE UPLOAD INTERACTION
// ============================================

const fileUploadArea = document.getElementById('fileUploadArea');
const fileInput = document.getElementById('referenceFiles');

fileUploadArea.addEventListener('click', function() {
    fileInput.click();
});

fileInput.addEventListener('change', function(e) {
    const files = this.files;
    
    if (files.length > 0) {
        fileUploadArea.querySelector('.file-upload-text').textContent = `${files.length} file(s) selected`;
        fileUploadArea.style.borderColor = 'var(--success)';
        fileUploadArea.style.background = 'var(--success-bg)';
    } else {
        fileUploadArea.querySelector('.file-upload-text').textContent = 'Upload files';
        fileUploadArea.style.borderColor = '';
        fileUploadArea.style.background = '';
    }
});

// Drag and drop functionality
fileUploadArea.addEventListener('dragover', function(e) {
    e.preventDefault();
    this.classList.add('drag-over');
});

fileUploadArea.addEventListener('dragleave', function() {
    this.classList.remove('drag-over');
});

fileUploadArea.addEventListener('drop', function(e) {
    e.preventDefault();
    this.classList.remove('drag-over');
    
    const files = e.dataTransfer.files;
    fileInput.files = files;
    
    if (files.length > 0) {
        fileUploadArea.querySelector('.file-upload-text').textContent = `${files.length} file(s) selected`;
        fileUploadArea.style.borderColor = 'var(--success)';
        fileUploadArea.style.background = 'var(--success-bg)';
    }
});

// ============================================
// SMOOTH SCROLL FOR ANCHOR LINKS
// ============================================

document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// ============================================
// FOOTER CURRENT YEAR
// ============================================

document.getElementById('currentYear').textContent = new Date().getFullYear();

// ============================================
// FORM VALIDATION HELPERS
// ============================================

// Real-time validation
document.querySelectorAll('.form-control, .form-select').forEach(input => {
    input.addEventListener('blur', function() {
        if (this.hasAttribute('required') && !this.value.trim()) {
            this.style.borderColor = 'var(--error)';
        } else {
            this.style.borderColor = '';
        }
    });

    input.addEventListener('input', function() {
        if (this.style.borderColor === 'var(--error)' && this.value.trim()) {
            this.style.borderColor = '';
        }
    });
});

// Email validation
document.getElementById('email').addEventListener('blur', function() {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (this.value && !emailRegex.test(this.value)) {
        this.style.borderColor = 'var(--error)';
        alert('Please enter a valid email address');
    }
});

// Phone validation (optional but format check)
document.getElementById('phone').addEventListener('blur', function() {
    if (this.value) {
        const phoneRegex = /^[\d\s\-\+\(\)]+$/;
        if (!phoneRegex.test(this.value)) {
            this.style.borderColor = 'var(--error)';
            alert('Please enter a valid phone number');
        }
    }
});

console.log('%c Portfolio Loaded Successfully! ', 'background: linear-gradient(135deg, #2563eb 0%, #7c3aed 100%); color: white; font-size: 16px; padding: 10px; border-radius: 5px;');
console.log('%c Remember to update the GOOGLE_SCRIPT_URL in script.js ', 'background: #ef4444; color: white; font-size: 14px; padding: 8px; border-radius: 5px;');