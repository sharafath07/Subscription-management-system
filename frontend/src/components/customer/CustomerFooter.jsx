
function CustomerFooter() {
    return (
        <footer className="border-t bg-white px-6 py-4 text-center">
            <p className="text-sm text-gray-500">
                © {new Date().getFullYear()} Subscription Management System.
                All rights reserved.
            </p>
        </footer>
    );
}

export default CustomerFooter;
