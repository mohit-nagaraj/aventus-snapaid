export function hasEmergencyLabel(labels: string[]): boolean {
    return labels.some(label =>
        label.toLowerCase().includes('emergency')
    );
}