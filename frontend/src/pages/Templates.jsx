import { useMemo, useState } from "react";

import { useTemplates } from "../context/TemplateContext";

import TemplateCard from "../components/TemplateCard";
import EditTemplateModal from "../components/EditTemplateModal";

import "../styles/Templates.css";

export default function Templates() {
    const {
    templates,
    loading,
    editTemplate,
} = useTemplates();

    const [search, setSearch] = useState("");

    const [category, setCategory] = useState("All");

    // -----------------------------
    // Edit Modal State
    // -----------------------------

    const [selectedTemplate, setSelectedTemplate] =
        useState(null);

    const [isEditOpen, setIsEditOpen] =
        useState(false);

    const openEditModal = (template) => {
        setSelectedTemplate(template);
        setIsEditOpen(true);
    };

    const closeEditModal = () => {
        setSelectedTemplate(null);
        setIsEditOpen(false);
    };

    // -----------------------------
    // Filter Templates
    // -----------------------------

    const filteredTemplates = useMemo(() => {

        return templates.filter((template) => {

            const matchesSearch =
                template.title
                    .toLowerCase()
                    .includes(search.toLowerCase());

            const matchesCategory =
                category === "All" ||
                template.category === category;

            return (
                matchesSearch &&
                matchesCategory
            );

        });

    }, [
        templates,
        search,
        category,
    ]);

    if (loading) {
        return (
            <div className="templates-loading">
                Loading Templates...
            </div>
        );
    }

    return (
        <>
            <div className="templates-page">

                {/* Header */}

                <div className="templates-header">

                    <div>

                        <h1>📋 Templates</h1>

                        <p>
                            Save once. Use forever.
                        </p>

                    </div>

                    <div className="template-count">

                        <span>
                            {templates.length}
                        </span>

                        <small>Total</small>

                    </div>

                </div>

                {/* Search */}

                <div className="search-box">

                    <span>🔍</span>

                    <input
                        className="template-search"
                        placeholder="Search templates..."
                        value={search}
                        onChange={(e) =>
                            setSearch(
                                e.target.value
                            )
                        }
                    />

                </div>

                {/* Category Tabs */}

                <div className="category-tabs">

                    {[
                        {
                            label: "All",
                            icon: "✨",
                        },
                        {
                            label: "Work",
                            icon: "💼",
                        },
                        {
                            label: "Study",
                            icon: "📚",
                        },
                        {
                            label: "Health",
                            icon: "❤️",
                        },
                        {
                            label: "Personal",
                            icon: "👤",
                        },
                    ].map((item) => (

                        <button
                            key={item.label}
                            className={
                                category === item.label
                                    ? "active"
                                    : ""
                            }
                            onClick={() =>
                                setCategory(
                                    item.label
                                )
                            }
                        >
                            {item.icon} {item.label}
                        </button>

                    ))}

                </div>

                {/* Template List */}

                <div className="template-list">

                    {filteredTemplates.length ===
                    0 ? (

                        <div className="empty-template">

                            <h2>
                                No Templates Yet
                            </h2>

                            <p>
                                Save your first
                                task as a template
                                and reuse it anytime.
                            </p>

                        </div>

                    ) : (

                        filteredTemplates.map(
                            (template) => (

                                <TemplateCard
                                    key={
                                        template._id
                                    }
                                    template={
                                        template
                                    }
                                    openEditModal={
                                        openEditModal
                                    }
                                />

                            )
                        )

                    )}

                </div>

            </div>

            {/* Edit Modal */}

            <EditTemplateModal
                isOpen={isEditOpen}
                template={selectedTemplate}
                onClose={closeEditModal}
                editTemplate={editTemplate}
            />
        </>
    );
}