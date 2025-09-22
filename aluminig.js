// In-memory "database" to simulate a backend for this self-contained prototype.
const users = JSON.parse(localStorage.getItem('alumniUsers')) || {};
const alumniProfiles = JSON.parse(localStorage.getItem('alumniProfiles')) || {};
let currentUser = null;
let currentUserProfile = null;

document.addEventListener('DOMContentLoaded', () => {
    // DOM elements
    const authSection = document.getElementById('auth-section');
    const mainSection = document.getElementById('main-section');
    const authTitle = document.getElementById('auth-title');
    const authForm = document.getElementById('auth-form');
    const authToggle = document.getElementById('auth-toggle');
    const emailInput = document.getElementById('email');
    const passwordInput = document.getElementById('password');
    const messageBox = document.getElementById('message-box');
    const messageText = document.getElementById('message-text');
    const profileForm = document.getElementById('profile-form');
    const alumniListContainer = document.getElementById('alumni-list-container');
    const profileImageDisplay = document.getElementById('profile-image-display');
    const userUidDisplay = document.getElementById('user-uid');
    const welcomeMessage = document.getElementById('welcome-message');
    const navProfile = document.getElementById('nav-profile');
    const navAlumni = document.getElementById('nav-alumni');
    const navEvents = document.getElementById('nav-events');
    const logoutBtn = document.getElementById('logout-btn');

    let isLogin = true;

    // Utility function to show modal messages
    function showMessage(text, isError = false) {
        messageText.textContent = text;
        if (isError) {
            messageBox.classList.add('bg-red-500');
            messageBox.classList.remove('bg-green-500');
        } else {
            messageBox.classList.remove('bg-red-500');
            messageBox.classList.add('bg-green-500');
        }
        messageBox.classList.remove('hidden');
        setTimeout(() => {
            messageBox.classList.add('hidden');
        }, 3000);
    }

    function handleLoggedInUser(user) {
        currentUser = user;
        fetchUserProfile(user.uid);
        renderAlumniList();
        showMainSection();
    }

    function showAuthSection() {
        authSection.classList.remove('hidden');
        mainSection.classList.add('hidden');
    }

    function showMainSection() {
        authSection.classList.add('hidden');
        mainSection.classList.remove('hidden');
    }

    function fetchUserProfile(uid) {
        currentUserProfile = Object.values(alumniProfiles).find(p => p.userId === uid);
        if (!currentUserProfile) {
            console.log("No profile found for this user!");
        }
        updateProfileUI();
    }

    function updateProfileUI() {
        if (!currentUser) {
            profileForm.reset();
            profileImageDisplay.src = "https://placehold.co/150x150/e2e8f0/64748b?text=No+Photo";
            welcomeMessage.textContent = "Welcome, Alumni!";
            userUidDisplay.textContent = 'User ID: Not signed in';
            return;
        }

        const { name, institution, graduationYear, currentRole, linkedin, github, avatar } = currentUserProfile;
        document.getElementById('name').value = name || '';
        document.getElementById('institution').value = institution || '';
        document.getElementById('graduation-year').value = graduationYear || '';
        document.getElementById('current-role').value = currentRole || '';
        document.getElementById('linkedin').value = linkedin || '';
        document.getElementById('github').value = github || '';
        profileImageDisplay.src = avatar || "https://placehold.co/150x150/e2e8f0/64748b?text=No+Photo";
        welcomeMessage.textContent = ⁠ Welcome, ${name || 'Alumni'}! ⁠;
        userUidDisplay.textContent = ⁠ User ID: ${currentUser.uid} ⁠;
    }

    function renderAlumniList() {
        alumniListContainer.innerHTML = '';
        const profiles = Object.values(alumniProfiles);
        if (profiles.length === 0) {
            alumniListContainer.innerHTML = '<p class="text-gray-500 text-center py-4">No alumni profiles found yet.</p>';
            return;
        }

        profiles.forEach(profile => {
            const alumniCard = document.createElement('div');
            alumniCard.className = 'bg-white rounded-xl shadow-md p-6 border border-gray-100 flex items-start space-x-4 mb-4';
            alumniCard.innerHTML = `
                <div class="flex-shrink-0">
                    <img class="h-16 w-16 rounded-full object-cover" src="${profile.avatar || 'https://placehold.co/150x150/e2e8f0/64748b?text=No+Photo'}" alt="Alumni profile picture">
                </div>
                <div class="flex-grow">
                    <h3 class="text-xl font-bold text-gray-900">${profile.name || 'Alumni Name'}</h3>
                    <p class="text-sm text-gray-500">${profile.currentRole || 'N/A'}</p>
                    <p class="text-sm text-gray-500">${profile.institution || 'N/A'}</p>
                    <p class="text-sm text-gray-500">Graduated: ${profile.graduationYear || 'N/A'}</p>
                    <div class="mt-2 flex space-x-3">
                        ${profile.linkedin ? ⁠ <a href="${profile.linkedin}" target="_blank" class="text-blue-600 hover:text-blue-800">LinkedIn</a> ⁠ : ''}
                        ${profile.github ? ⁠ <a href="${profile.github}" target="_blank" class="text-gray-600 hover:text-gray-800">GitHub</a> ⁠ : ''}
                    </div>
                </div>
            `;
            alumniListContainer.appendChild(alumniCard);
        });
    }
    
    authToggle.addEventListener('click', (e) => {
        e.preventDefault();
        isLogin = !isLogin;
        authTitle.textContent = isLogin ? 'Log In' : 'Sign Up';
        authToggle.textContent = isLogin ? 'Need an account? Sign Up' : 'Already have an account? Log In';
    });

    authForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = emailInput.value.trim();
        const password = passwordInput.value.trim();

        if (!email || !password) {
            showMessage("Please enter both email and password.", true);
            return;
        }

        if (isLogin) {
            if (users[email] && users[email].password === password) {
                const user = users[email];
                showMessage("Logged in successfully!");
                handleLoggedInUser(user);
            } else {
                showMessage("Invalid email or password.", true);
            }
        } else {
            if (users[email]) {
                showMessage("Email is already in use.", true);
            } else {
                const user = { email: email, password: password, uid: Date.now().toString() };
                users[email] = user;
                localStorage.setItem('alumniUsers', JSON.stringify(users));
                
                const initials = email.split('@')[0].split(' ').map(n => n[0]).join('').toUpperCase().substring(0,2);
                const avatarURL = ⁠ https://placehold.co/150x150/e2e8f0/64748b?text=${initials} ⁠;

                const initialProfileData = {
                    email: email,
                    name: email.split('@')[0],
                    institution: "",
                    graduationYear: "",
                    currentRole: "",
                    linkedin: "",
                    github: "",
                    avatar: avatarURL,
                    userId: user.uid,
                };
                alumniProfiles[user.uid] = initialProfileData;
                localStorage.setItem('alumniProfiles', JSON.stringify(alumniProfiles));

                showMessage("Account created and profile initialized!");
                handleLoggedInUser(user);
            }
        }
    });

    profileForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        if (!currentUser) {
            showMessage("Please log in to update your profile.", true);
            return;
        }
        
        const fullName = document.getElementById('name').value.trim();
        let initials = 'NA';
        if (fullName) {
            const parts = fullName.split(' ');
            initials = parts.map(n => n.charAt(0)).join('').toUpperCase().substring(0,3);
        }
        const avatarURL = ⁠ https://placehold.co/150x150/e2e8f0/64748b?text=${initials} ⁠;

        const updatedProfileData = {
            ...currentUserProfile,
            name: fullName,
            institution: document.getElementById('institution').value,
            graduationYear: document.getElementById('graduation-year').value,
            currentRole: document.getElementById('current-role').value,
            linkedin: document.getElementById('linkedin').value,
            github: document.getElementById('github').value,
            avatar: avatarURL
        };
        
        alumniProfiles[currentUser.uid] = updatedProfileData;
        localStorage.setItem('alumniProfiles', JSON.stringify(alumniProfiles));
        currentUserProfile = updatedProfileData;

        showMessage("Profile updated successfully!");
        updateProfileUI();
        renderAlumniList();
    });

    // Handle navigation between sections
    navProfile.addEventListener('click', () => {
        document.getElementById('profile-section').classList.remove('hidden');
        document.getElementById('alumni-section').classList.add('hidden');
        document.getElementById('events-section').classList.add('hidden');
        navProfile.classList.add('bg-gray-100');
        navAlumni.classList.remove('bg-gray-100');
        navEvents.classList.remove('bg-gray-100');
    });

    navAlumni.addEventListener('click', () => {
        document.getElementById('profile-section').classList.add('hidden');
        document.getElementById('alumni-section').classList.remove('hidden');
        document.getElementById('events-section').classList.add('hidden');
        navProfile.classList.remove('bg-gray-100');
        navAlumni.classList.add('bg-gray-100');
        navEvents.classList.remove('bg-gray-100');
    });

    navEvents.addEventListener('click', () => {
        document.getElementById('profile-section').classList.add('hidden');
        document.getElementById('alumni-section').classList.add('hidden');
        document.getElementById('events-section').classList.remove('hidden');
        navProfile.classList.remove('bg-gray-100');
        navAlumni.classList.remove('bg-gray-100');
        navEvents.classList.add('bg-gray-100');
    });

    // Logout
    logoutBtn.addEventListener('click', async () => {
        currentUser = null;
        showMessage("Logged out successfully.");
        showAuthSection();
    });

    if (currentUser) {
        handleLoggedInUser(currentUser);
    } else {
        showAuthSection();
    }
});
