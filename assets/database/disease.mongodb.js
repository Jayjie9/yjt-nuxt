/*
 * 疾病百科数据库设计
 * 数据库名称: medical_encyclopedia
 */

/*
 * 疾病分类集合 (disease_categories)
 * 字段说明：
 * - name: 分类名称，如"内科
db.createCollection('disease_categories', {
    validator: {
        $jsonSchema: {
            bsonType: 'object',
            required: ['name', 'icon', 'color'],
            properties: {
                name: { bsonType: 'string' },
                icon: { bsonType: 'string' },
                color: { bsonType: 'string' },
                description: { bsonType: 'string' },
                parent_id: { bsonType: ['objectId', 'null'] },
                order: { bsonType: 'int' },
                is_active: { bsonType: 'bool' }
            }
        }
    }
});

/*
 * 疾病详情集合 (diseases)
 * 字段说明：
 * - name: 疾病名称
 * - category_id: 所属分类ID
 * - description: 疾病描述
 * - symptoms: 症状列表
 * - causes: 病因列表
 * - treatments: 治疗方法列表
 * - prevention: 预防措施列表
 * - risk_factors: 危险因素列表
 * - complications: 并发症列表
 * - seasonal_info: 季节性信息
 *   - season: 多发季节
 *   - prevalence: 发病率描述
 * - stats: 统计信息
 *   - views: 浏览次数
 *   - bookmarks: 收藏次数
 * - created_at: 创建时间
 * - updated_at: 更新时间
 */

// 插入示例数据
db.diseases.insertMany([
    {
        name: '高血压',
        category_id: db.disease_categories.findOne({ name: '内科' })._id,
        description: '血压持续高于正常范围的循环系统疾病',
        symptoms: ['头痛', '头晕', '心悸', '耳鸣'],
        causes: ['遗传因素', '不良生活习惯', '压力过大'],
        treatments: ['药物治疗', '生活方式调整', '定期监测血压'],
        prevention: ['限制盐分摄入', '规律运动', '保持心理平衡'],
        risk_factors: ['肥胖', '吸烟', '过量饮酒', '高盐饮食'],
        complications: ['心脏病', '脑卒中', '肾功能损害'],
        seasonal_info: {
            season: '全年',
            prevalence: '常年发病，冬季高发'
        },
        stats: {
            views: 15000,
            bookmarks: 3500
        },
        created_at: new Date(),
        updated_at: new Date()
    }
]);

// 疾病详情集合
db.createCollection('diseases', {
    validator: {
        $jsonSchema: {
            bsonType: 'object',
            required: ['name', 'category_id', 'description'],
            properties: {
                name: { bsonType: 'string' },
                category_id: { bsonType: 'objectId' },
                description: { bsonType: 'string' },
                symptoms: { bsonType: 'array', items: { bsonType: 'string' } },
                causes: { bsonType: 'array', items: { bsonType: 'string' } },
                treatments: { bsonType: 'array', items: { bsonType: 'string' } },
                prevention: { bsonType: 'array', items: { bsonType: 'string' } },
                risk_factors: { bsonType: 'array', items: { bsonType: 'string' } },
                complications: { bsonType: 'array', items: { bsonType: 'string' } },
                seasonal_info: {
                    bsonType: 'object',
                    properties: {
                        season: { bsonType: 'string' },
                        prevalence: { bsonType: 'string' }
                    }
                },
                stats: {
                    bsonType: 'object',
                    properties: {
                        views: { bsonType: 'int' },
                        bookmarks: { bsonType: 'int' }
                    }
                },
                created_at: { bsonType: 'date' },
                updated_at: { bsonType: 'date' }
            }
        }
    }
});

/*
 * 症状分析记录集合 (symptom_analysis)
 * 字段说明：
 * - user_id: 用户ID
 * - symptoms: 用户输入的症状列表
 * - possible_diseases: 可能的疾病列表
 *   - disease_id: 疾病ID
 *   - name: 疾病名称
 *   - probability: 可能性概率
 *   - description: 疾病描述
 * - risk_level: 风险等级（低、中、高）
 * - recommendations: 建议列表
 * - created_at: 分析时间
 */

// 插入示例数据
db.symptom_analysis.insertMany([
    {
        user_id: ObjectId(),
        symptoms: ['发热', '咳嗽', '乏力'],
        possible_diseases: [
            {
                disease_id: ObjectId(),
                name: '感冒',
                probability: 0.8,
                description: '上呼吸道感染导致的常见疾病'
            },
            {
                disease_id: ObjectId(),
                name: '流感',
                probability: 0.6,
                description: '由流感病毒引起的急性呼吸道传染病'
            }
        ],
        risk_level: '中等',
        recommendations: ['多休息', '多喝水', '如症状加重及时就医'],
        created_at: new Date()
    }
]);

// 症状分析记录集合
db.createCollection('symptom_analysis', {
    validator: {
        $jsonSchema: {
            bsonType: 'object',
            required: ['symptoms', 'possible_diseases', 'risk_level', 'created_at'],
            properties: {
                user_id: { bsonType: 'objectId' },
                symptoms: { bsonType: 'array', items: { bsonType: 'string' } },
                possible_diseases: {
                    bsonType: 'array',
                    items: {
                        bsonType: 'object',
                        properties: {
                            disease_id: { bsonType: 'objectId' },
                            name: { bsonType: 'string' },
                            probability: { bsonType: 'double' },
                            description: { bsonType: 'string' }
                        }
                    }
                },
                risk_level: { bsonType: 'string' },
                recommendations: { bsonType: 'array', items: { bsonType: 'string' } },
                created_at: { bsonType: 'date' }
            }
        }
    }
});

/*
 * AI问诊记录集合 (ai_consultations)
 * 字段说明：
 * - user_id: 用户ID
 * - messages: 对话消息列表
 *   - role: 角色（user/assistant）
 *   - content: 消息内容
 *   - timestamp: 消息时间
 * - created_at: 会话创建时间
 * - updated_at: 最后更新时间
 */

// 插入示例数据
db.ai_consultations.insertMany([
    {
        user_id: ObjectId(),
        messages: [
            {
                role: 'user',
                content: '我最近经常感觉头晕，该怎么办？',
                timestamp: new Date()
            },
            {
                role: 'assistant',
                content: '头晕可能由多种原因引起，建议您先测量血压，并注意以下几点：\n1. 保证充足的休息和睡眠\n2. 避免长时间盯着电子屏幕\n3. 保持规律饮食，补充足够水分\n如果症状持续，建议及时就医检查。',
                timestamp: new Date()
            }
        ],
        created_at: new Date(),
        updated_at: new Date()
    }
]);

// AI问诊记录集合
db.createCollection('ai_consultations', {
    validator: {
        $jsonSchema: {
            bsonType: 'object',
            required: ['messages', 'created_at'],
            properties: {
                user_id: { bsonType: 'objectId' },
                messages: {
                    bsonType: 'array',
                    items: {
                        bsonType: 'object',
                        properties: {
                            role: { bsonType: 'string' },
                            content: { bsonType: 'string' },
                            timestamp: { bsonType: 'date' }
                        }
                    }
                },
                created_at: { bsonType: 'date' },
                updated_at: { bsonType: 'date' }
            }
        }
    }
});

/*
 * 健康资讯集合 (health_articles)
 * 字段说明：
 * - title: 文章标题
 * - summary: 文章摘要
 * - content: 文章内容
 * - image: 配图URL
 * - author_id: 作者ID
 * - category_ids: 文章分类ID列表
 * - tags: 标签列表
 * - stats: 统计信息
 *   - views: 浏览次数
 *   - likes: 点赞数
 *   - shares: 分享数
 * - status: 文章状态（draft/published）
 * - created_at: 创建时间
 * - updated_at: 更新时间
 * - published_at: 发布时间
 */

// 插入示例数据
db.health_articles.insertMany([
    {
        title: '高血压患者的饮食指南',
        summary: '合理的饮食控制对高血压患者至关重要，本文提供详细的饮食建议。',
        content: '高血压患者在日常饮食中应注意以下几点：\n1. 限制盐分摄入\n2. 增加钾的摄入\n3. 控制总热量\n4. 限制饱和脂肪酸的摄入\n5. 增加膳食纤维的摄入',
        image: '/images/articles/diet-guide.jpg',
        author_id: ObjectId(),
        category_ids: [ObjectId()],
        tags: ['高血压', '饮食指南', '健康生活'],
        stats: {
            views: 5000,
            likes: 320,
            shares: 150
        },
        status: 'published',
        created_at: new Date(),
        updated_at: new Date(),
        published_at: new Date()
    }
]);

// 健康资讯集合
db.createCollection('health_articles', {
    validator: {
        $jsonSchema: {
            bsonType: 'object',
            required: ['title', 'summary', 'content', 'created_at'],
            properties: {
                title: { bsonType: 'string' },
                summary: { bsonType: 'string' },
                content: { bsonType: 'string' },
                image: { bsonType: 'string' },
                author_id: { bsonType: 'objectId' },
                category_ids: { bsonType: 'array', items: { bsonType: 'objectId' } },
                tags: { bsonType: 'array', items: { bsonType: 'string' } },
                stats: {
                    bsonType: 'object',
                    properties: {
                        views: { bsonType: 'int' },
                        likes: { bsonType: 'int' },
                        shares: { bsonType: 'int' }
                    }
                },
                status: { bsonType: 'string' },
                created_at: { bsonType: 'date' },
                updated_at: { bsonType: 'date' },
                published_at: { bsonType: 'date' }
            }
        }
    }
});

// 创建索引
db.disease_categories.createIndex({ name: 1 }, { unique: true });
db.diseases.createIndex({ name: 1 }, { unique: true });
db.diseases.createIndex({ category_id: 1 });
db.diseases.createIndex({ "stats.views": -1 });
db.symptom_analysis.createIndex({ user_id: 1, created_at: -1 });
db.ai_consultations.createIndex({ user_id: 1, created_at: -1 });
db.health_articles.createIndex({ title: 1 });
db.health_articles.createIndex({ created_at: -1 });
db.health_articles.createIndex({ category_ids: 1 });
db.health_articles.createIndex({ tags: 1 });