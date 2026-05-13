interface RuntimeEnvironment {
    googleClientId?: string;
}

const runtimeEnvironment =
    typeof window !== 'undefined'
        ? (window as Window & { __AGORA_ENV__?: RuntimeEnvironment }).__AGORA_ENV__
        : undefined;

export const environment = {
    apiUrl: 'https://api.agora.diego-barraza-dev.com/',
    googleClientId: runtimeEnvironment?.googleClientId ?? ''
};
